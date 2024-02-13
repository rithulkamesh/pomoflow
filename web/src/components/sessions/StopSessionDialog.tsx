import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

interface StopSessionDialogProps {
  stopSession: () => Promise<void>;
  children: React.ReactNode;
  leave?: boolean;
}

export const StopSessionDialog: React.FC<StopSessionDialogProps> = ({
  stopSession,
  children,
  leave,
}) => {
  const { toast } = useToast();
  const [confirmed, setConfirmed] = useState<boolean>(false);

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {leave ? "Leave the session" : "Stop this session?"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {leave ? "leave" : "stop"} this session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant={"ghost"} disabled={confirmed}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            disabled={confirmed}
            onClick={() => {
              setConfirmed(true);
              stopSession().catch(() => {
                toast({
                  title: "Error",
                  description: "Failed to stop session",
                });
              });
            }}>
            {leave ? "Leave" : "Stop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
