import { z } from "zod/v4";

export const sendMessageSchema = z.object({
  content: z.string().min(1),
  channelId: z.uuid(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
