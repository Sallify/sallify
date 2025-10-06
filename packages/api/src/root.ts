import { authRouter } from "./router/auth";
import { serverRouter } from "./router/server";
import { testRouter } from "./router/test";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  server: serverRouter,
  test: testRouter,
});

export type AppRouter = typeof appRouter;
