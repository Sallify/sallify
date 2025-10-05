import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useRouteContext } from "@tanstack/react-router";
import {
  ChevronsUpDownIcon,
  LaptopMinimalIcon,
  LogOutIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
} from "lucide-react";
import { type Theme, useTheme } from "@/components/theme-provider";
import { getInitials } from "@/utils/get-initials";
import { startThemeTransition } from "@/utils/theme-transition";

type UserButtonProps = React.ComponentProps<typeof DropdownMenuTrigger>;

export function UserButton({ ...props }: UserButtonProps) {
  const { user } = useRouteContext({
    from: "/_authed/",
  });

  const { theme, systemTheme, setTheme } = useTheme();

  function handleThemeToggle(newTheme: Theme) {
    const resolvedCurrent = theme === "system" ? systemTheme : theme;
    const resolvedNext = newTheme === "system" ? systemTheme : newTheme;

    if (resolvedCurrent === resolvedNext) {
      return setTheme(newTheme);
    }

    startThemeTransition(() => setTheme(newTheme));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild {...props}>
        <Button
          className="h-12 p-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground dark:data-[state=open]:bg-accent/50"
          size="lg"
          variant="ghost"
        >
          <Avatar className="size-8 rounded-lg">
            {user.image && <AvatarImage alt={user.name} src={user.image} />}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <ChevronsUpDownIcon className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
        side="top"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {user.image && <AvatarImage alt={user.name} src={user.image} />}
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PaletteIcon /> Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => {
                    handleThemeToggle("light");
                  }}
                >
                  <SunIcon />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleThemeToggle("dark");
                  }}
                >
                  <MoonIcon /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleThemeToggle("system");
                  }}
                >
                  <LaptopMinimalIcon /> System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
