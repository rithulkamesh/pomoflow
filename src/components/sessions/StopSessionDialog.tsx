import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

interface StopSessionDialogProps {
  stopSession: () => Promise<void>;
  children: React.ReactNode;
}

export const StopSessionDialog: React.FC<StopSessionDialogProps> = ({
  stopSession,
  children,
}) => {
  const { toast } = useToast();
  const [confirmed, setConfirmed] = useState<boolean>(false);

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stop this session?</DialogTitle>
          <DialogDescription>
            Are you sure you want to stop this session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant={'ghost'} disabled={confirmed}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            disabled={confirmed}
            onClick={() => {
              setConfirmed(true);
              stopSession().catch(() => {
                toast({
                  title: 'Error',
                  description: 'Failed to stop session',
                });
              });
            }}
          >
            Stop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
