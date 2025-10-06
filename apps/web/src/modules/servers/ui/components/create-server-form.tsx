import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { DialogFooter } from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import {
  type CreateServerInput,
  createServerSchema,
} from "@repo/validators/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc";

type CreateServerFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CreateServerForm({
  onSuccess,
  onCancel,
}: CreateServerFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createServer = useMutation(
    trpc.server.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(trpc.server.getMany.queryOptions());

        navigate({
          to: "/channels/$serverId/$channelId",
          params: {
            serverId: data.id,
            channelId: data.channel.id,
          },
        });

        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<CreateServerInput>({
    resolver: zodResolver(createServerSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
    },
  });

  const isPending = createServer.isPending;

  function onSubmit(values: CreateServerInput) {
    createServer.mutate(values);
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server name</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  placeholder="e.g. Awesome Server"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isPending}
                  placeholder="Type your server description here"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button
            className="flex-1"
            disabled={isPending}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Create server
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
