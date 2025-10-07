import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { ClockIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc";
import { getInitials } from "@/utils/get-initials";

export const Route = createFileRoute("/invite/$code")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.server.getInviteByCode.queryOptions({ code: params.code })
    );

    const user = await context.queryClient.ensureQueryData(
      context.trpc.auth.getCurrentUser.queryOptions()
    );

    return { user };
  },
});

function RouteComponent() {
  const trpc = useTRPC();
  const params = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const location = useLocation();

  const { data } = useSuspenseQuery(
    trpc.server.getInviteByCode.queryOptions({ code: params.code })
  );

  const joinServer = useMutation(
    trpc.server.join.mutationOptions({
      onSuccess: (rdata) => {
        queryClient.invalidateQueries(trpc.server.getMany.queryOptions());

        navigate({
          to: "/channels/$serverId/$channelId",
          params: {
            serverId: rdata.serverId,
            channelId: rdata.channelId,
          },
        });
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occured while joining the server"
        );
      },
    })
  );

  const isPending = joinServer.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-balance font-semibold text-4xl">
            You've been invited to join
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect with the community
          </p>
        </div>
        <Card className="overflow-hidden shadow-2xl">
          <div className="px-8">
            <div className="mb-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="mb-2 font-semibold text-3xl">{data.name}</h2>
                  {data.description && (
                    <p className="text-pretty text-muted-foreground">
                      {data.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-4 flex gap-6">
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-muted-foreground" />
                <span className="font-medium text-sm">
                  {data.members.length} members
                </span>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="mb-6">
              <h3 className="mb-3 font-semibold text-muted-foreground text-sm uppercase">
                Invited By
              </h3>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Avatar className="h-10 w-10">
                  {data.invites.createdByUser.image && (
                    <AvatarImage
                      alt={data.invites.createdByUser.name}
                      src={data.invites.createdByUser.image}
                    />
                  )}
                  <AvatarFallback>
                    {getInitials(data.invites.createdByUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">
                    {data.invites.createdByUser.name}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full"
                disabled={isPending}
                isLoading={isPending}
                onClick={() => {
                  if (!user) {
                    return navigate({
                      to: "/auth/sign-in",
                      search: {
                        redirectUrl: location.pathname,
                      },
                    });
                  }

                  joinServer.mutate({ code: params.code });
                }}
                size="lg"
              >
                Accept Invite
              </Button>
              <p className="flex items-center justify-center gap-1 text-center text-muted-foreground text-xs">
                <ClockIcon className="size-3" />
                Invite expires never
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
