import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/channels/@me/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>friends & activity</div>;
}
