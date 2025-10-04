import { createEnv } from "@t3-oss/env-core";
import { type } from "arktype";
import { configDotenv } from "dotenv";

configDotenv({ path: "../../.env", quiet: true });

export const env = createEnv({
  server: {
    AUTH_SECRET: type("string"),
    AUTH_DISCORD_ID: type("string"),
    AUTH_DISCORD_SECRET: type("string"),
    AUTH_URL: type("string"),
    DATABASE_URL: type("string"),
    REDIS_URL: type("string"),
  },
  clientPrefix: "VITE_",
  client: {
    VITE_WS_URL: type("string"),
    VITE_PRODUCTION_URL: type("string"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
