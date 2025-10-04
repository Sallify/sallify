import type { AppRouter } from "@repo/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  createTRPCClient,
  createWSClient,
  httpBatchStreamLink,
  loggerLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import { TRPCProvider } from "./lib/trpc";
import { authClient } from "./modules/auth/lib/client";
import { routeTree } from "./routeTree.gen";

const getRequestHeaders = createServerFn({ method: "GET" }).handler(() => {
  const request = getRequest();
  const headers = new Headers(request.headers);

  return Object.fromEntries(headers);
});

let browserWsClient: ReturnType<typeof createWSClient> | undefined;

function getBrowserWsClient() {
  if (typeof window === "undefined") {
    return;
  }
  if (!browserWsClient) {
    browserWsClient = createWSClient({
      url: import.meta.env.VITE_WS_URL,
      connectionParams: async () => {
        const { data, error } = await authClient.token();

        if (error) {
          throw error;
        }

        return {
          token: data.token,
        };
      },
    });
  }
  return browserWsClient;
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000 },
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });

  const wsClient = getBrowserWsClient();

  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      splitLink({
        condition: (op) => op.type === "subscription" && !!wsClient,
        true: wsLink({
          // biome-ignore lint/style/noNonNullAssertion: Assert non-null because of condition
          client: wsClient!,
          transformer: superjson,
        }),
        false: httpBatchStreamLink({
          transformer: superjson,
          url: getUrl(),
          async headers() {
            return await getRequestHeaders();
          },
        }),
      }),
    ],
  });

  const trpc = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
  });

  return createRouter({
    context: { queryClient, trpc },
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    Wrap: (props) => {
      return (
        <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
          <QueryClientProvider client={queryClient}>
            {props.children}
          </QueryClientProvider>
        </TRPCProvider>
      );
    },
  });
};

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") {
      return "";
    }

    return import.meta.env.VITE_PRODUCTION_URL;
  })();

  return `${base}/api/trpc`;
}
