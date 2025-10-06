import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button, buttonVariants } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { HouseIcon, PlusIcon } from "lucide-react";
import { Suspense, useState } from "react";
import { useTRPC } from "@/lib/trpc";
import { AddServerDialog } from "@/modules/servers/ui/components/add-server-dialog";
import { getInitials } from "@/utils/get-initials";

export function ServerList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="size-10 shrink-0 rounded-lg"
            onClick={() => setIsAddDialogOpen(true)}
            size="icon"
            variant="secondary"
          >
            <PlusIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Add a server</p>
        </TooltipContent>
      </Tooltip>
      <Suspense fallback={<ServerListLoading />}>
        <ServerListSuspense />
      </Suspense>
      <AddServerDialog
        onOpenChange={setIsAddDialogOpen}
        open={isAddDialogOpen}
      />
    </div>
  );
}

function ServerListSuspense() {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.server.getMany.queryOptions());

  return (
    <>
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
    </>
  );
}

export function ServerListLoading() {
  const loadingServers = Array.from({ length: 5 }).map((_, i) => ({
    key: `loading-server-${i}`,
  }));

  return (
    <>
      {loadingServers.map((server) => (
        <Skeleton className="size-10 rounded-full" key={server.key} />
      ))}
    </>
  );
}
