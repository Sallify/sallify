import { Button, buttonVariants } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import { ChevronDownIcon, HashIcon, PlusIcon } from "lucide-react";
import { useTRPC } from "@/lib/trpc";

export function ChannelList() {
  const params = useParams({
    from: "/_authed/channels/$serverId",
  });
  const location = useLocation();

  const trpc = useTRPC();

  const {
    data: { channels },
  } = useSuspenseQuery(
    trpc.server.getOne.queryOptions({
      id: params.serverId,
    })
  );

  return (
    <div className="w-full space-y-0.5 px-2 py-4">
      <Collapsible className="space-y-0.5" defaultOpen>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="group flex items-center gap-1 rounded-md p-1 transition-colors hover:bg-accent/50">
            <ChevronDownIcon className="size-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
              Channels
            </span>
          </CollapsibleTrigger>
          {/* TODO: Create new channel */}
          <Button
            className="size-6 p-1 text-muted-foreground hover:text-foreground"
            size="icon-sm"
            variant="ghost"
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
        <CollapsibleContent className="space-y-0.5">
          {channels.map((channel) => (
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
                serverId: channel.serverId,
                channelId: channel.id,
              }}
              to="/channels/$serverId/$channelId"
            >
              <HashIcon />
              <span>{channel.name}</span>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
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
