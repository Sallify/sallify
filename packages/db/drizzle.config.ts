import { env } from "@repo/env";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
} satisfies Config;
