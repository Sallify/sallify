import { initAuth } from "@repo/auth";
import { env } from "@repo/env";
import { getRequest } from "@tanstack/react-start/server";
import { cache } from "react";

export const auth = initAuth({
  baseUrl: env.AUTH_URL,
  productionUrl: env.VITE_PRODUCTION_URL,
  secret: env.AUTH_SECRET,
  discordClientId: env.AUTH_DISCORD_ID,
  discordClientSecret: env.AUTH_DISCORD_SECRET,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: getRequest().headers })
);
