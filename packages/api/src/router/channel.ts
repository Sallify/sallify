import type { TRPCRouterRecord } from "@trpc/server";

export const channelRouter = {
  // getManyByServerId: protectedProcedure
  //   .input(
  //     z.object({
  //       id: z.string(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const isMember = await ctx.db.query.member.findFirst({
  //       where: and(
  //         eq(member.serverId, input.id),
  //         eq(member.userId, ctx.user.id)
  //       ),
  //     });
  //     if (!isMember) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "You are not a member of this server.",
  //       });
  //     }
  //     const channels = await ctx.db.query.channel.findMany({
  //       where: eq(channel.serverId, input.id),
  //       orderBy: channel.position,
  //     });
  //     return channels;
  //   }),
} satisfies TRPCRouterRecord;
