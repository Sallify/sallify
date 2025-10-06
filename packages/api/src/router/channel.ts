import { eq } from "@repo/db";
import { channel } from "@repo/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";
import { protectedProcedure } from "../trpc";

export const channelRouter = {
  getManyByServerId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: only allow access to members

      const channels = await ctx.db.query.channel.findMany({
        where: eq(channel.serverId, input.id),
        orderBy: channel.position,
      });
      return channels;
    }),
} satisfies TRPCRouterRecord;
