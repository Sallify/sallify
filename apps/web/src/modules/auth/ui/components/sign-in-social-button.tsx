import { Badge } from "@repo/ui/components/badge";
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

  const lastMethod = authClient.getLastUsedLoginMethod();

  return (
    <div className="relative w-full">
      <Button
        className="w-full"
        disabled={isPending || isSuccess || disabled}
        onClick={() => signIn.mutate()}
        type="button"
        variant="outline"
        {...props}
      >
        {children}
        {lastMethod === provider && (
          <Badge className="-top-1.5 -right-1.5 absolute">Last used</Badge>
        )}
      </Button>
    </div>
  );
}
