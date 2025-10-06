import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import {
  ServerList,
  ServerListLoading,
} from "@/modules/servers/ui/components/server-list";

export const Route = createFileRoute("/_authed")({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData({
      ...context.trpc.auth.getCurrentUser.queryOptions(),
      revalidateIfStale: true,
    });

    if (!user) {
      throw redirect({
        to: "/auth/sign-in",
        search: {
          redirectUrl: location.pathname,
        },
      });
    }

    context.queryClient.prefetchQuery(
      context.trpc.server.getMany.queryOptions()
    );

    return { user };
  },
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<ServerListLoading />}>
        <ServerList />
      </Suspense>
      <Outlet />
    </div>
  );
}
