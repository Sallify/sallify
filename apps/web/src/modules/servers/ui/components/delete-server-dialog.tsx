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

type DeleteServerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteServerDialog({
  open,
  onOpenChange,
}: DeleteServerDialogProps) {
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

  const deleteServer = useMutation(
    trpc.server.delete.mutationOptions({
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

  const isPending = deleteServer.isPending;

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete '{data.name}'</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{data.name}</span>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={isPending}
              isLoading={isPending}
              onClick={() =>
                deleteServer.mutate({
                  id: data.id,
                })
              }
              variant="destructive"
            >
              Delete server
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
