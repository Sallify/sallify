import { publicProcedure } from "../trpc";

export const authRouter = {
  getUser: publicProcedure.query(({ ctx }) => {
    return ctx.session?.user || null;
  }),
};
