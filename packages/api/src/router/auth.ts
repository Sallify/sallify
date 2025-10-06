import type { TRPCRouterRecord } from "@trpc/server";
import { publicProcedure } from "../trpc";

export const authRouter = {
  getCurrentUser: publicProcedure.query(({ ctx }) => {
    return ctx.session?.user || null;
  }),
} satisfies TRPCRouterRecord;
