import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/channels/@me/$dmId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>DM Message list</div>;
}
