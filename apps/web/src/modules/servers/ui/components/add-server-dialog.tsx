import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { CreateServerForm } from "@/modules/servers/ui/components/create-server-form";

type AddServerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddServerDialog({ open, onOpenChange }: AddServerDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add a server</DialogTitle>
          <DialogDescription>
            Create a new server or join an existing one.
          </DialogDescription>
        </DialogHeader>
        <Tabs className="w-full" defaultValue="create">
          <TabsList className="w-full">
            <TabsTrigger value="create">Create server</TabsTrigger>
            <TabsTrigger value="join">Join server</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <CreateServerForm
              onCancel={() => onOpenChange(false)}
              onSuccess={() => onOpenChange(false)}
            />
          </TabsContent>
          <TabsContent value="join">
            {/* <JoinServerForm
              onCancel={() => onOpenChange(false)}
              onSuccess={() => onOpenChange(false)}
            /> */}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
