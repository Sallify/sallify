import type { Auth, Session } from "@repo/auth";
import { db } from "@repo/db/client";
import { env } from "@repo/env";
import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { createRemoteJWKSet, jwtVerify } from "jose";
import superjson from "superjson";

async function validateToken(token: string) {
  try {
    const baseUrl = env.AUTH_URL;

    const JWKS = createRemoteJWKSet(new URL(`${baseUrl}/api/auth/jwks`));

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: baseUrl,
      audience: baseUrl,
    });

    return payload;
  } catch (error) {
    console.error("Token validation failed:", error);
    throw error;
  }
}

export const createTRPCContext = async (
  opts:
    | {
        headers: Headers;
        auth: Auth;
      }
    | CreateWSSContextFnOptions
) => {
  const isWs = "info" in opts;

  if (isWs) {
    const payload = await validateToken(
      opts.info.connectionParams?.token || ""
    );

    return {
      db,
      user: payload as Session["user"],
    };
  }

  const authApi = opts.auth.api;
  const session = await authApi.getSession({
    headers: opts.headers,
  });
  return {
    authApi,
    session,
    db,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  const user = ctx.session?.user ?? ctx.user;

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user,
      session: ctx.session ? { ...ctx.session, user } : undefined,
    },
  });
});
