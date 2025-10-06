import { publicProcedure } from "../trpc";

export const authRouter = {
  getCurrentUser: publicProcedure.query(({ ctx }) => {
    return ctx.session?.user || null;
  }),
};
