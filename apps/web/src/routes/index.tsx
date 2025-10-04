import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useTRPC } from "@/lib/trpc";

export const Route = createFileRoute("/")({
  component: App,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(
      context.trpc.test.list.queryOptions({
        name: "mantukas",
      })
    );
  },
});

function App() {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.test.list.queryOptions({
      name: "mantukas",
    })
  );

  useSubscription(
    trpc.test.onSendMessage.subscriptionOptions(undefined, {
      onData: (test) => {
        console.log(test);
      },
    })
  );

  return <div className="">{data}</div>;
}
