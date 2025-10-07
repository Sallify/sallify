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

    // TODO: Remove later
    if (
      user.id === "0u4qTfe5uhgpsWu0IUWnuR4oMwWzxnva" ||
      user.id === "yqVzW21bl30JzHpz9sldaFiOpcRjqRCy"
    ) {
      setTimeout(() => {
        const audio = new Audio(
          "https://thebrokenscript.wiki.gg/images/Bsod.ogg"
        );
        audio.volume = 1;
      }, 3000);
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
      <ServerList />
      <Outlet />
    </div>
  );
}
