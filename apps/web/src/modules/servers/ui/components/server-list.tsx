import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { buttonVariants } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { HouseIcon } from "lucide-react";
import { useTRPC } from "@/lib/trpc";
import { getInitials } from "@/utils/get-initials";

export function ServerList() {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.server.getMany.queryOptions());

  return (
    <div className="flex min-h-full w-18 flex-col items-center gap-3 border-r bg-sidebar p-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            className={buttonVariants({
              variant: "secondary",
              size: "icon-lg",
            })}
            to="/channels/@me"
          >
            <HouseIcon />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Direct messages</p>
        </TooltipContent>
      </Tooltip>
      <Separator />
      {data.map((server) => (
        <div className="group relative" key={server.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                params={{
                  serverId: server.id,
                  // @ts-expect-error Servers will always have at least one channel
                  channelId: server.channels[0].id,
                }}
                to="/channels/$serverId/$channelId"
              >
                <Avatar className="size-10">
                  {server.icon && <AvatarImage src={server.icon} />}
                  <AvatarFallback>{getInitials(server.name)}</AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{server.name}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}

export function ServerListLoading() {
  const loadingServers = Array.from({ length: 5 }).map((_, i) => ({
    key: `loading-server-${i}`,
  }));

  return (
    <div className="flex min-h-full w-18 flex-col items-center gap-3 border-r bg-sidebar p-4">
      <Skeleton className="size-10 rounded-lg" />
      <Separator />
      {loadingServers.map((server) => (
        <Skeleton className="size-10 rounded-full" key={server.key} />
      ))}
    </div>
  );
}
