import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { UserPlusIcon } from "lucide-react";
import { useTRPC } from "@/lib/trpc";
import { ServerDropdown } from "./server-dropdown";

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
    <div className="flex h-12 max-w-[300px] items-center justify-between gap-2 border-b p-2">
      <ServerDropdown server={data} />
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
