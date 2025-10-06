import { buttonVariants } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import { HashIcon } from "lucide-react";
import { useTRPC } from "@/lib/trpc";

export function ChannelList() {
  const params = useParams({
    from: "/_authed/channels/$serverId",
  });
  const location = useLocation();

  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.channel.getManyByServerId.queryOptions({
      id: params.serverId,
    })
  );

  return (
    <div className="w-full space-y-0.5 px-2 py-4">
      {data.map((channel) => (
        <Link
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-full justify-start rounded-md px-2 py-1",
            location.pathname.includes(channel.id)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
          key={channel.id}
          params={{
            serverId: params.serverId,
            channelId: channel.id,
          }}
          to="/channels/$serverId/$channelId"
        >
          <HashIcon />
          <span>{channel.name}</span>
        </Link>
      ))}
    </div>
  );
}

export function ChannelListLoading() {
  const loadingChannels = Array.from({ length: 5 }).map((_, i) => ({
    key: `loading-channel-${i}`,
  }));

  return (
    <div className="w-full space-y-0.5 px-2 py-4">
      {loadingChannels.map((channel) => (
        <Skeleton className="h-8 w-full rounded-md" key={channel.key} />
      ))}
    </div>
  );
}
