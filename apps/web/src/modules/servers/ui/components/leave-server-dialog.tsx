import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc";

type LeaveServerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LeaveServerDialog({
  open,
  onOpenChange,
}: LeaveServerDialogProps) {
  const params = useParams({
    from: "/_authed/channels/$serverId",
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data } = useSuspenseQuery(
    trpc.server.getOne.queryOptions({
      id: params.serverId,
    })
  );

  const leaveServer = useMutation(
    trpc.server.leave.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.server.getMany.queryOptions());

        navigate({
          to: "/channels/@me",
        });

        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "An error occured while deleting server");
      },
    })
  );

  const isPending = leaveServer.isPending;

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave '{data.name}'</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave{" "}
            <span className="font-semibold">{data.name}</span>? You won't be
            able to re-join this server unless you are re-invited.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={isPending}
              isLoading={isPending}
              onClick={() =>
                leaveServer.mutate({
                  id: data.id,
                })
              }
              variant="destructive"
            >
              Leave server
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
