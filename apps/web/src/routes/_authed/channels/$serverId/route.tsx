import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ServerSidebar } from "@/modules/servers/ui/components/server-sidebar";

export const Route = createFileRoute("/_authed/channels/$serverId")({
  component: RouteComponent,
  beforeLoad: ({ context, params }) => {
    context.queryClient.prefetchQuery(
      context.trpc.server.getOne.queryOptions({
        id: params.serverId,
      })
    );

    context.queryClient.prefetchQuery(
      context.trpc.channel.getManyByServerId.queryOptions({
        id: params.serverId,
      })
    );
  },
});

function RouteComponent() {
  return (
    <>
      <ServerSidebar />
      <Outlet />
      <div className="bg-purple-500">member list</div>
    </>
  );
}
