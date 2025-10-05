import { type TRPCRouterRecord, tracked } from "@trpc/server";
import { z } from "zod/v4";
import { protectedProcedure, publicProcedure } from "../trpc";

export const testRouter = {
  list: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `hello ${input.name}`;
    }),
  onSendMessage: protectedProcedure.subscription(async function* (opts) {
    const { signal } = opts;
    let count = 0;

    const abortController = new AbortController();
    signal?.addEventListener("abort", () => abortController.abort(), {
      once: true,
    });

    try {
      while (!abortController.signal.aborted) {
        count++;
        const message = `Username: ${opts.ctx.user.name} Interval message ${count} at ${new Date().toISOString()}`;
        console.log("Sending:", message);

        yield tracked(String(Date.now()), message);

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, 5000);
          abortController.signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(new Error("Subscription aborted"));
          });
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Subscription aborted") {
        console.log("Subscription for onSendMessage gracefully aborted.");
      } else {
        console.error("Error in onSendMessage subscription:", error);
      }
    } finally {
      console.log("onSendMessage subscription cleanup complete.");
    }
  }),
} satisfies TRPCRouterRecord;
