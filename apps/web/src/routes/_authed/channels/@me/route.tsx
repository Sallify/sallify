import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/channels/@me")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="bg-green-500">Friend list</div>
      <Outlet />
    </>
  );
}
