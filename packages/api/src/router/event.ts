import { subscribeToEvents } from "@repo/redis/events";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../trpc";

export const eventRouter = {
  onEvent: protectedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.user.id;

    try {
      for await (const event of subscribeToEvents(userId, signal)) {
        yield event;
      }
    } catch (error) {
      console.error("Failed to subscribe to events:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),
} satisfies TRPCRouterRecord;
