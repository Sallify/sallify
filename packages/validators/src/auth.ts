import { z } from "zod/v4";

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().min(4),
  email: z.email(),
  password: z.string().min(1),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
