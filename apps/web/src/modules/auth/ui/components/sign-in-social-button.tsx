import { Button } from "@repo/ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/modules/auth/lib/client";

type SignInSocialButtonProps = {
  provider: string;
  callbackURL: string;
} & React.ComponentProps<typeof Button>;

export function SignInSocialButton({
  provider,
  callbackURL,
  disabled,
  children,
  ...props
}: SignInSocialButtonProps) {
  const signIn = useMutation({
    mutationFn: async () =>
      await authClient.signIn.social(
        {
          provider,
          callbackURL,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "An error occured while signing in.");
          },
        }
      ),
  });

  const isPending = signIn.isPending;
  const isSuccess = signIn.isSuccess;

  return (
    <Button
      disabled={isPending || isSuccess || disabled}
      type="button"
      variant="outline"
      {...props}
      onClick={() => signIn.mutate()}
    >
      {children}
    </Button>
  );
}
