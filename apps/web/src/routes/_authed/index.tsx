import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
  component: App,
});

function App() {
  const { user } = Route.useRouteContext();

  return (
    <div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
