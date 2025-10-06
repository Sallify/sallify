import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/channels/$serverId/$channelId/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const params = useParams({
    from: "/_authed/channels/$serverId/$channelId/",
  });

  return <div className="w-full">channel: {params.channelId}</div>;
}
