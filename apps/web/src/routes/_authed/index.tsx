import { createFileRoute } from "@tanstack/react-router";
import { UserButton } from "@/modules/auth/ui/components/user-button";

export const Route = createFileRoute("/_authed/")({
  component: App,
});

function App() {
  return (
    <div>
      <UserButton className="w-60" />
    </div>
  );
}
