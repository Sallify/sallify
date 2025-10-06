import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ChevronDownIcon, UserPlusIcon } from "lucide-react";
import { useTRPC } from "@/lib/trpc";

export function ServerHeader() {
  const params = useParams({
    from: "/_authed/channels/$serverId",
  });

  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.server.getOne.queryOptions({
      id: params.serverId,
    })
  );

  return (
    <div className="flex h-12 items-center justify-between border-b p-2">
      <Button size="sm" variant="ghost">
        {data.name}
        <ChevronDownIcon />
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon-sm" variant="ghost">
            <UserPlusIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Invite to server</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function ServerHeaderLoading() {
  return (
    <div className="flex h-12 items-center justify-between border-b p-2">
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
