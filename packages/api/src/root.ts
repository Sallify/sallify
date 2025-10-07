import { authRouter } from "./router/auth";
import { channelRouter } from "./router/channel";
import { eventRouter } from "./router/event";
import { memberRouter } from "./router/member";
import { messageRouter } from "./router/message";
import { serverRouter } from "./router/server";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  server: serverRouter,
  channel: channelRouter,
  member: memberRouter,
  message: messageRouter,
  event: eventRouter,
});

export type AppRouter = typeof appRouter;
