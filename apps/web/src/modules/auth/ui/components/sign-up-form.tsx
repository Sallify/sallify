import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import { useTRPC } from "@/lib/trpc";
import { authClient } from "@/modules/auth/lib/client";
import { SignInSocialButton } from "./sign-in-social-button";

const formSchema = z.object({
  name: z.string().min(4),
  email: z.email(),
  password: z.string().min(1),
});

export function SignUpForm() {
  const { redirectUrl } = useRouteContext({
    from: "/auth",
  });
  const navigate = useNavigate();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const signUp = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      await authClient.signUp.email(
        {
          ...values,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "An error occured while signing up.");
          },
          onSuccess: () => {
            queryClient.removeQueries({
              queryKey: trpc.auth.getUser.queryKey(),
            });
            navigate({ to: redirectUrl });
          },
        }
      );
    },
  });

  const isPending = signUp.isPending;

  function onSubmit(values: z.infer<typeof formSchema>) {
    signUp.mutate(values);
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="John Doe"
                  type="text"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="m@example.com"
                  type="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full flex-col gap-3">
          <Button disabled={isPending} isLoading={isPending} type="submit">
            Create account
          </Button>
          <SignInSocialButton
            callbackURL={redirectUrl}
            disabled={isPending}
            provider="discord"
          >
            Sign up with Discord
          </SignInSocialButton>
          <p className="text-center text-muted-foreground text-sm leading-normal">
            Already have an account?{" "}
            <Link
              className="underline underline-offset-4 hover:text-primary"
              to="/auth/sign-in"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
