import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { receptionAccountSchema } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCreateReceptionAccount } from '@/hooks/api/useReceptions';
import { useLocale } from '@/hooks/useLocale';
import { Reception } from '@/types/reception.types';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type ReceptionAccountFormData = z.infer<typeof receptionAccountSchema>;

interface ReceptionAccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reception?: Reception | null;
}

export function ReceptionAccountForm({
  open,
  onOpenChange,
  reception,
}: ReceptionAccountFormProps) {
  const { text } = useLocale();
  const createAccount = useCreateReceptionAccount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReceptionAccountFormData>({
    resolver: zodResolver(receptionAccountSchema),
  });

  useEffect(() => {
    if (open && reception) {
      reset({
        email: reception.email,
        phone: reception.phone || '',
        password: '',
      });
    } else if (!open) {
      reset({
        email: '',
        phone: '',
        password: '',
      });
    }
  }, [open, reception, reset]);

  const onSubmit = (data: ReceptionAccountFormData) => {
    if (!reception) return;
    createAccount.mutate(
      {
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        role: 'reception',
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{text('إنشاء حساب استقبال', 'Create Reception Account')}</DialogTitle>
          <DialogDescription>
            {text(
              'يجب أن يطابق البريد الإلكتروني ملف الاستقبال.',
              'Email must match the reception profile.'
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{text('البريد الإلكتروني', 'Email')}</Label>
            <Input type="email" {...register('email')} readOnly />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text('رقم الهاتف', 'Phone')}</Label>
            <Input {...register('phone')} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text('كلمة المرور', 'Password')} *</Label>
            <Input type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {text('إلغاء', 'Cancel')}
            </Button>
            <Button type="submit" disabled={createAccount.isPending}>
              {createAccount.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {text('إنشاء حساب', 'Create Account')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
