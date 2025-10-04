import { env } from "@repo/env";
import { createClient } from "redis";

export const pub = createClient({
  url: env.REDIS_URL,
});
pub.connect();

export const sub = createClient({
  url: env.REDIS_URL,
});
sub.connect();
