import { createFileRoute } from "@tanstack/react-router";
import { SignUpView } from "@/modules/auth/ui/view/sign-up-view";

export const Route = createFileRoute("/auth/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUpView />;
}
