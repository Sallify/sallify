import { channel } from "@repo/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const createChannelSchema = createInsertSchema(channel, {
  name: z.string().min(1),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  position: true,
  topic: true,
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
