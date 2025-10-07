import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import {
  type SendMessageInput,
  sendMessageSchema,
} from "@repo/validators/message";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  createFileRoute,
  useParams,
  useRouteContext,
} from "@tanstack/react-router";
import { useSubscription } from "@trpc/tanstack-react-query";
import { HashIcon, SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc";
import { getInitials } from "@/utils/get-initials";

export const Route = createFileRoute("/_authed/channels/$serverId/$channelId/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const params = useParams({
    from: "/_authed/channels/$serverId/$channelId/",
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { user } = useRouteContext({
    from: "/_authed",
  });

  const { data: server } = useSuspenseQuery(
    trpc.server.getOne.queryOptions({
      id: params.serverId,
    })
  );

  const currentChannel = server.channels.find((c) => c.id === params.channelId);

  if (!currentChannel) {
    throw new Error("Channel not found");
  }

  const { data: messages } = useSuspenseQuery(
    trpc.message.getMany.queryOptions({
      channelId: params.channelId,
    })
  );

  useSubscription(
    trpc.event.onEvent.subscriptionOptions(undefined, {
      onData: (data) => {
        if (!data) {
          return;
        }

        switch (data.type) {
          case "MESSAGE_CREATED":
            queryClient.setQueryData(
              trpc.message.getMany.queryKey({
                channelId: data.payload.channelId,
              }),
              (oldData) => {
                if (!oldData) {
                  return oldData;
                }

                return [
                  ...oldData,
                  {
                    id: Math.random()
                      .toString(36)
                      .substring(2, 7)
                      .toUpperCase(),
                    content: data.payload.content,
                    author: {
                      id: "temp",
                      name: data.payload.author.name,
                      email: "",
                      emailVerified: false,
                      image: data.payload.author.image || null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    },
                    channelId: data.payload.channelId,
                    authorId: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    editedAt: new Date(),
                  },
                ];
              }
            );
            break;

          default:
            break;
        }
      },
    })
  );

  const form = useForm<SendMessageInput>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      channelId: params.channelId,
      content: "",
    },
  });

  const sendMessage = useMutation(
    trpc.message.send.mutationOptions({
      onMutate: () => {
        queryClient.setQueryData(
          trpc.message.getMany.queryKey({ channelId: params.channelId }),
          (oldData) => {
            if (!oldData) {
              return oldData;
            }

            return [
              ...oldData,
              {
                id: Math.random().toString(36).substring(2, 7).toUpperCase(),
                content: form.getValues("content"),
                author: {
                  id: "temp",
                  name: user.name,
                  email: "",
                  emailVerified: false,
                  image: user.image || null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                channelId: params.channelId,
                authorId: user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                editedAt: new Date(),
              },
            ];
          }
        );

        form.reset();
      },
      onSuccess: (newData) => {
        console.log("new data", newData);
        // TODO: scroll to bottom
      },
      onError: (error) => {
        toast.error(
          error.message || "Unexpected error occurred while sending message"
        );
      },
    })
  );

  function onSubmit(values: SendMessageInput) {
    sendMessage.mutate(values);
  }

  const isPending = sendMessage.isPending;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-12 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <HashIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">{currentChannel.name}</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              className="flex gap-3 rounded-lg p-2 hover:bg-muted"
              key={message.id}
            >
              <div className="cursor-pointer">
                <Avatar className="h-10 w-10">
                  {message.author.image && (
                    <AvatarImage
                      alt={message.author.name}
                      src={message.author.image}
                    />
                  )}
                  <AvatarFallback>
                    {getInitials(message.author.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="cursor-pointer font-semibold hover:underline">
                    {message.author.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t p-4">
        <div className="">
          <Form {...form}>
            <form
              className="flex flex-1 items-center gap-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        className="w-full! flex-1! border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={isPending}
                        placeholder={`Message #${currentChannel.name}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="ml-auto"
                disabled={isPending}
                size="icon"
                type="submit"
              >
                <SendIcon />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
