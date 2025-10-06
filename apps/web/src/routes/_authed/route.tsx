import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ServerList } from "@/modules/servers/ui/components/server-list";

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

    return { user };
  },
});

function RouteComponent() {
  return (
    <div className="flex">
      <ServerList />
      <Outlet />
    </div>
  );
}
