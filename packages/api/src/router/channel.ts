import { eq, sql } from "@repo/db";
import { channel, server } from "@repo/db/schema";
import { createChannelSchema } from "@repo/validators/channel";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../trpc";

export const channelRouter = {
  create: protectedProcedure
    .input(createChannelSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const existingServer = await tx.query.server.findFirst({
          where: eq(server.id, input.serverId),
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

        const maxPositionResult = await ctx.db
          .select({
            maxPosition: sql<number>`max(${channel.position})`.mapWith(Number),
          })
          .from(channel)
          .where(eq(channel.serverId, input.serverId));

        const maxPosition = maxPositionResult[0]?.maxPosition ?? -1;
        const newPosition = maxPosition + 1;

        const [createdChannel] = await tx
          .insert(channel)
          .values({
            ...input,
            position: newPosition,
          })
          .returning({
            id: channel.id,
          });

        if (!createdChannel) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create server",
          });
        }

        return {
          id: createdChannel.id,
        };
      });
    }),
} satisfies TRPCRouterRecord;
