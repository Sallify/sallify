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
import { type SignInInput, signInSchema } from "@repo/validators/auth";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/modules/auth/lib/client";
import { SignInSocialButton } from "@/modules/auth/ui/components/sign-in-social-button";

export function SignInForm() {
  const { redirectUrl } = useRouteContext({
    from: "/auth",
  });

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signIn = useMutation({
    mutationFn: async (values: SignInInput) => {
      await authClient.signIn.email(
        {
          ...values,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "An error occured while signing in.");
          },
        }
      );
    },
  });

  const isPending = signIn.isPending;

  function onSubmit(values: SignInInput) {
    signIn.mutate(values);
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
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
              <div className="flex items-center">
                <FormLabel>Password</FormLabel>
                <Link
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  to="."
                >
                  Forgot your password?
                </Link>
              </div>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="••••••••"
                  type="password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full flex-col gap-3">
          <Button disabled={isPending} isLoading={isPending} type="submit">
            Login
          </Button>
          <SignInSocialButton
            callbackURL={redirectUrl}
            disabled={isPending}
            provider="discord"
          >
            Login with Discord
          </SignInSocialButton>
          <p className="text-center text-muted-foreground text-sm leading-normal">
            Don't have an account?{" "}
            <Link
              className="underline underline-offset-4 hover:text-primary"
              to="/auth/sign-up"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
