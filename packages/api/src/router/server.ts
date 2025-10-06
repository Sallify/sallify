import { and, eq, exists, or } from "@repo/db";
import { channel, member, server } from "@repo/db/schema";
import { createServerSchema } from "@repo/validators/server";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../trpc";

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

        return {
          ...createdServer,
          channel: {
            id: createdChannel.id,
          },
        };
      });
    }),
} satisfies TRPCRouterRecord;
