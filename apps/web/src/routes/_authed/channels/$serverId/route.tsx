import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/channels/$serverId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="bg-pink-500">channel list</div>
      <Outlet />
      <div className="bg-purple-500">member list</div>
    </>
  );
}
