import { server } from "@repo/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const createServerSchema = createInsertSchema(server, {
  name: z.string().min(1),
}).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateServerInput = z.infer<typeof createServerSchema>;
