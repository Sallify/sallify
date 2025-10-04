import { pub, sub } from ".";
import type { EventMap } from "./types";

function getUserEventKey(userId: string) {
  return `user:${userId}:events`;
}

export async function publishEvent<K extends keyof EventMap>(
  userIds: string[],
  event: EventMap[K]
) {
  await Promise.all(
    userIds.map((userId) =>
      pub.publish(getUserEventKey(userId), JSON.stringify(event))
    )
  );
}

export async function* subscribeToEvents(
  userId: string,
  signal?: AbortSignal
): AsyncGenerator<EventMap[keyof EventMap], void, unknown> {
  const channel = getUserEventKey(userId);
  const queue: EventMap[keyof EventMap][] = [];

  let resolveNext:
    | ((value: IteratorResult<EventMap[keyof EventMap]>) => void)
    | null = null;
  let abortListener: (() => void) | null = null;

  const handler = (message: string) => {
    try {
      const event = JSON.parse(message) as EventMap[keyof EventMap];
      if (resolveNext) {
        resolveNext({ value: event, done: false });
        resolveNext = null;
      } else {
        queue.push(event);
      }
    } catch (err) {
      console.error("Failed to parse user event:", err, message);
    }
  };

  await sub.subscribe(channel, handler);

  try {
    while (!signal?.aborted) {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item !== undefined) {
          yield item;
        }
      }

      if (!signal?.aborted) {
        const next = await new Promise<
          IteratorResult<EventMap[keyof EventMap]>
        >((resolve) => {
          resolveNext = resolve;

          if (signal) {
            abortListener = () => {
              if (resolveNext) {
                resolveNext({ value: undefined, done: true });
                resolveNext = null;
              }
            };
            signal.addEventListener("abort", abortListener, { once: true });
          }
        });

        if (next.done) {
          break;
        }
        yield next.value;
      }
    }
  } finally {
    if (signal && abortListener) {
      signal.removeEventListener("abort", abortListener);
    }

    resolveNext = null;
    await sub.unsubscribe(channel, handler);
  }
}
