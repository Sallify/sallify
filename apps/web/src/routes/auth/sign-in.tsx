import { createFileRoute } from "@tanstack/react-router";
import { SignInView } from "@/modules/auth/ui/view/sign-in-view";

export const Route = createFileRoute("/auth/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInView />;
}
