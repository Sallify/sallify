import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/channels/$serverId/$channelId/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  return <div>channel messages</div>;
}
