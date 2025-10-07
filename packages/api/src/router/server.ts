import { and, eq, exists, or } from "@repo/db";
import { channel, invite, member, server } from "@repo/db/schema";
import { createServerSchema } from "@repo/validators/server";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";
import { protectedProcedure, publicProcedure } from "../trpc";

export const serverRouter = {
  getMany: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.server.findMany({
      where: or(
        eq(server.ownerId, ctx.user.id),
        exists(
          ctx.db
            .select()
            .from(member)
            .where(
              and(
                eq(member.userId, ctx.user.id),
                eq(member.serverId, server.id)
              )
            )
        )
      ),
      with: {
        channels: {
          columns: {
            id: true,
          },
          orderBy: channel.position,
          limit: 1,
        },
      },
    });
  }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const existingServer = await ctx.db.query.server.findFirst({
        where: eq(server.id, input.id),
        with: {
          members: true,
          channels: {
            orderBy: channel.position,
            columns: {
              topic: false,
              createdAt: false,
              updatedAt: false,
            },
          },
        },
      });

      if (!existingServer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found",
        });
      }

      const { members, ...serverWithoutMembers } = existingServer;

      if (
        serverWithoutMembers.ownerId !== ctx.user.id &&
        !members.some((m) => m.userId === ctx.user.id)
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are not a member of this server",
        });
      }

      return serverWithoutMembers;
    }),
  create: protectedProcedure
    .input(createServerSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [createdServer] = await tx
          .insert(server)
          .values({
            ...input,
            ownerId: ctx.user.id,
          })
          .returning({ id: server.id });

        if (!createdServer) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create server",
          });
        }

        const [createdChannel] = await tx
          .insert(channel)
          .values({
            name: "general",
            type: "text",
            serverId: createdServer.id,
          })
          .returning({ id: channel.id });

        if (!createdChannel) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create general channel",
          });
        }

        await tx.insert(member).values({
          serverId: createdServer.id,
          userId: ctx.user.id,
        });

        await tx.insert(invite).values({
          serverId: createdServer.id,
          code: Math.random().toString(36).substring(2, 7).toUpperCase(),
          createdBy: ctx.user.id,
        });

        return {
          ...createdServer,
          channel: {
            id: createdChannel.id,
          },
        };
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingServer = await ctx.db.query.server.findFirst({
        where: eq(server.id, input.id),
      });

      if (!existingServer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found",
        });
      }

      if (existingServer.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the owner of this server",
        });
      }

      await ctx.db.delete(server).where(eq(server.id, input.id));
    }),
  leave: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingServer = await ctx.db.query.server.findFirst({
        where: eq(server.id, input.id),
        with: {
          members: {
            columns: {
              userId: true,
            },
          },
        },
      });

      if (!existingServer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found",
        });
      }

      if (!existingServer.members.some((mem) => mem.userId === ctx.user.id)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are not a member of this server",
        });
      }

      if (existingServer.ownerId === ctx.user.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are the owner of this server",
        });
      }

      await ctx.db
        .delete(member)
        .where(
          and(eq(member.serverId, input.id), eq(member.userId, ctx.user.id))
        );
    }),
  getInviteByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const serverWithInvite = await ctx.db.query.server.findFirst({
        with: {
          invites: {
            where: eq(invite.code, input.code),
            with: {
              createdByUser: true,
            },
            limit: 1,
          },
          members: {
            columns: {
              userId: true,
            },
          },
        },
      });

      if (!serverWithInvite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found",
        });
      }

      if (!serverWithInvite.invites[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      return {
        ...serverWithInvite,
        invites: serverWithInvite.invites[0],
      };
    }),
  join: protectedProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const serverWithInvite = await tx.query.server.findFirst({
          with: {
            invites: {
              where: eq(invite.code, input.code),
              limit: 1,
            },
            channels: {
              columns: {
                id: true,
              },
              orderBy: channel.position,
              limit: 1,
            },
            members: {
              columns: {
                userId: true,
              },
            },
          },
        });

        if (!serverWithInvite) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Server not found",
          });
        }

        if (!serverWithInvite.invites[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invite not found",
          });
        }

        if (
          serverWithInvite.invites[0].maxUses &&
          serverWithInvite.invites[0].uses >=
            serverWithInvite.invites[0].maxUses
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invite code has reached its maximum uses",
          });
        }

        if (serverWithInvite.members.some((m) => m.userId === ctx.user.id)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You are already a member of this server",
          });
        }

        await tx.insert(member).values({
          serverId: serverWithInvite.id,
          userId: ctx.user.id,
        });

        await tx
          .update(invite)
          .set({
            uses: serverWithInvite.invites[0].uses + 1,
          })
          .where(eq(invite.code, input.code));

        return {
          serverId: serverWithInvite.id,
          // biome-ignore lint/style/noNonNullAssertion: TODO
          channelId: serverWithInvite.channels[0]!.id,
        };
      });
    }),
} satisfies TRPCRouterRecord;
