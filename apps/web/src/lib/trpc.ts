import type { AppRouter } from "@repo/api";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>();
