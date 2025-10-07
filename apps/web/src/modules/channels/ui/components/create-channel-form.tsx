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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
  type CreateChannelInput,
  createChannelSchema,
} from "@repo/validators/channel";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { HashIcon, Volume2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc";

type CreateChannelFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CreateChannelForm({
  onSuccess,
  onCancel,
}: CreateChannelFormProps) {
  const params = useParams({
    from: "/_authed/channels/$serverId/$channelId/",
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createChannel = useMutation(
    trpc.channel.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.server.getOne.queryOptions({
            id: params.serverId,
          })
        );

        navigate({
          to: "/channels/$serverId/$channelId",
          params: {
            serverId: params.serverId,
            channelId: data.id,
          },
        });

        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<CreateChannelInput>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      type: "text",
      serverId: params.serverId,
    },
  });

  const isPending = createChannel.isPending;

  function onSubmit(values: CreateChannelInput) {
    createChannel.mutate(values);
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel type</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex flex-col"
                  defaultValue={field.value}
                  disabled={isPending}
                  onValueChange={field.onChange}
                >
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="text" />
                    </FormControl>
                    <FormLabel>Text</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="voice" />
                    </FormControl>
                    <FormLabel>Voice</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel name</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    disabled={isPending}
                    placeholder="new-channel"
                    type="text"
                    {...field}
                  />
                  <InputGroupAddon>
                    {form.watch().type === "text" ? (
                      <HashIcon />
                    ) : (
                      <Volume2Icon />
                    )}
                  </InputGroupAddon>
                </InputGroup>
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
            Create channel
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
