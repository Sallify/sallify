import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/channels/$serverId/$channelId")({
  beforeLoad: ({ context, params }) => {
    context.queryClient.prefetchQuery(
      context.trpc.message.getMany.queryOptions({
        channelId: params.channelId,
      })
    );
  },
});
