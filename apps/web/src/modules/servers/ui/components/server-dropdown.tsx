import type { RouterOutputs } from "@repo/api";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useRouteContext } from "@tanstack/react-router";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { useState } from "react";
import { DeleteServerDialog } from "./delete-server-dialog";
import { LeaveServerDialog } from "./leave-server-dialog";

type ServerDropdownProps = {
  server: RouterOutputs["server"]["getOne"];
};

export function ServerDropdown({ server }: ServerDropdownProps) {
  const { user } = useRouteContext({
    from: "/_authed",
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="max-w-[244px] items-center justify-start overflow-hidden"
            size="sm"
            variant="ghost"
          >
            <span className="truncate">{server.name}</span>
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            {user.id === server.ownerId ? (
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                <LogOutIcon />
                Delete server
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setIsLeaveDialogOpen(true)}>
                <LogOutIcon />
                Leave server
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteServerDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      />
      <LeaveServerDialog
        onOpenChange={setIsLeaveDialogOpen}
        open={isLeaveDialogOpen}
      />
    </>
  );
}
