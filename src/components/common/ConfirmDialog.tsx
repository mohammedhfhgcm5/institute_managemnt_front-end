import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  confirmText,
  cancelText,
  variant = 'destructive',
}: ConfirmDialogProps) {
  const { text } = useLocale();
  const resolvedConfirmText = confirmText || text('تأكيد', 'Confirm');
  const resolvedCancelText = cancelText || text('إلغاء', 'Cancel');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {resolvedCancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {resolvedConfirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
