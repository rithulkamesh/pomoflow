import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';

interface StopSessionDialogProps {
  stopSession: () => Promise<void>;
  children: React.ReactNode;
}

export const StopSessionDialog: React.FC<StopSessionDialogProps> = ({
  stopSession,
  children,
}) => {
  const { toast } = useToast();

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
            <Button variant={'ghost'}>Cancel</Button>
          </DialogClose>

          <Button
            onClick={() => {
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
