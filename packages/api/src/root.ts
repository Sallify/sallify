import { authRouter } from "./router/auth";
import { channelRouter } from "./router/channel";
import { memberRouter } from "./router/member";
import { serverRouter } from "./router/server";
import { testRouter } from "./router/test";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  server: serverRouter,
  channel: channelRouter,
  member: memberRouter,
  test: testRouter,
});

export type AppRouter = typeof appRouter;
