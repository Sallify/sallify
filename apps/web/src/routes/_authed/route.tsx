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
    if (user.id === "0u4qTfe5uhgpsWu0IUWnuR4oMwWzxnva") {
      setTimeout(() => {
        document.body.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        height:100vh;
        flex-direction:column;
        font-family:sans-serif;
        color:black;
      ">
        <h1>Aw, Snap!</h1>
        <p>Something went wrong while displaying this webpage.</p>
      </div>
    `;
        document.body.style.background = "#f1f3f4";
      }, 100);
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
