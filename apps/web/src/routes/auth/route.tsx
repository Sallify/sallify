import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { z } from "zod/v4";

const authSearchSchema = z.object({
  redirectUrl: z.string().min(2).optional().default("/").catch("/"),
});

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  validateSearch: authSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.ensureQueryData(
      context.trpc.auth.getCurrentUser.queryOptions()
    );

    if (user) {
      throw redirect({
        to: search.redirectUrl,
      });
    }

    return {
      redirectUrl: search.redirectUrl,
    };
  },
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
