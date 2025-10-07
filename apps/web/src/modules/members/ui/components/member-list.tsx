import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTRPC } from "@/lib/trpc";
import { getInitials } from "@/utils/get-initials";

export function MemberList() {
  return (
    <div className="w-[256px] space-y-0.5 border-l px-2 py-4">
      <Suspense fallback={<MemberListLoading />}>
        <MemberListSuspense />
      </Suspense>
    </div>
  );
}

function MemberListSuspense() {
  const trpc = useTRPC();
  const params = useParams({
    from: "/_authed/channels/$serverId",
  });

  const { data } = useSuspenseQuery(
    trpc.member.getManyByServerId.queryOptions({
      id: params.serverId,
    })
  );

  return (
    <>
      {data.map((member) => (
        <div
          className="group flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 hover:bg-accent"
          key={member.id}
        >
          <div className="relative">
            <Avatar className="h-8 w-8">
              {member.user.image && (
                <AvatarImage alt={member.user.name} src={member.user.image} />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(member.user.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <span className="truncate font-medium text-sm">
              {member.user.name}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

function MemberListLoading() {
  const loadingMembers = Array.from({ length: 5 }).map((_, i) => ({
    key: `loading-member-${i}`,
  }));

  return (
    <>
      {loadingMembers.map((member) => (
        <Skeleton className="h-10 w-full" key={member.key} />
      ))}
    </>
  );
}
