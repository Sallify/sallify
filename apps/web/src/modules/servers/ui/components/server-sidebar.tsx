import { Suspense } from "react";
import {
  ChannelList,
  ChannelListLoading,
} from "@/modules/channels/ui/components/channel-list";
import {
  ServerHeader,
  ServerHeaderLoading,
} from "@/modules/servers/ui/components/server-header";

export function ServerSidebar() {
  return (
    <div className="min-h-full w-[300px] shrink-0 bg-sidebar">
      <Suspense fallback={<ServerHeaderLoading />}>
        <ServerHeader />
      </Suspense>
      <Suspense fallback={<ChannelListLoading />}>
        <ChannelList />
      </Suspense>
    </div>
  );
}
