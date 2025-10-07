import { eq } from "@repo/db";
import { member } from "@repo/db/schema";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";
import { protectedProcedure } from "../trpc";

export const memberRouter = {
  getManyByServerId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const members = await ctx.db.query.member.findMany({
        where: eq(member.serverId, input.id),
        with: {
          user: true,
        },
      });

      if (!members.some((m) => m.userId === ctx.user.id)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are not a member of this server",
        });
      }

      return members;
    }),
} satisfies TRPCRouterRecord;
