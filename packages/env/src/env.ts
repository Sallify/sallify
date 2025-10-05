import { createEnv } from "@t3-oss/env-core";
import { configDotenv } from "dotenv";
import { z } from "zod/v4";

configDotenv({ path: "../../.env", quiet: true });

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string(),
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    AUTH_URL: z.string(),
    DATABASE_URL: z.string(),
    REDIS_URL: z.string(),
  },
  clientPrefix: "VITE_",
  client: {
    VITE_WS_URL: z.string(),
    VITE_PRODUCTION_URL: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
