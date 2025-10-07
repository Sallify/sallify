import { eq } from "@repo/db";
import { channel, message } from "@repo/db/schema";
import { publishEvent } from "@repo/redis/events";
import { sendMessageSchema } from "@repo/validators/message";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";
import { protectedProcedure, publicProcedure } from "../trpc";

export const messageRouter = {
  getMany: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.message.findMany({
        where: eq(message.channelId, input.channelId),
        with: {
          author: true,
        },
      });
    }),
  send: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const existingServer = await ctx.db.query.server.findFirst({
        with: {
          channels: {
            where: eq(channel.id, input.channelId),
            limit: 1,
          },
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

      if (!existingServer.channels[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel not found",
        });
      }

      if (!existingServer.members.some((m) => m.userId === ctx.user.id)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this server",
        });
      }

      const [newMessage] = await ctx.db
        .insert(message)
        .values({
          ...input,
          authorId: ctx.user.id,
        })
        .returning();

      try {
        await publishEvent(
          existingServer.members
            .filter((m) => m.userId !== ctx.user.id)
            .map((m) => m.userId),
          {
            type: "MESSAGE_CREATED",
            payload: {
              serverId: existingServer.id,
              channelId: input.channelId,
              content: input.content,
              author: {
                name: ctx.user.name,
                image: ctx.user.image || null,
              },
            },
          }
        );
      } catch (error) {
        console.log(error);
      }

      return {
        ...newMessage,
        author: {
          name: ctx.user.name,
          image: ctx.user.image,
        },
      };
    }),
} satisfies TRPCRouterRecord;
