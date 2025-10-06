import { and, eq, exists, or } from "@repo/db";
import { channel, member, server } from "@repo/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
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
} satisfies TRPCRouterRecord;
