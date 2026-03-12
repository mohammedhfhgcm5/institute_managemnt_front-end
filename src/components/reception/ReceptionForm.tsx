import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { receptionSchema } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCreateReception, useUpdateReception } from '@/hooks/api/useReceptions';
import { useLocale } from '@/hooks/useLocale';
import { Reception } from '@/types/reception.types';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type ReceptionFormData = z.infer<typeof receptionSchema>;

interface ReceptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reception?: Reception | null;
}

export function ReceptionForm({ open, onOpenChange, reception }: ReceptionFormProps) {
  const { text } = useLocale();
  const createReception = useCreateReception();
  const updateReception = useUpdateReception();
  const isEditing = !!reception;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReceptionFormData>({
    resolver: zodResolver(receptionSchema),
  });

  useEffect(() => {
    if (reception) {
      reset({
        firstName: reception.firstName,
        lastName: reception.lastName,
        phone: reception.phone,
        email: reception.email,
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
      });
    }
  }, [reception, reset]);

  const onSubmit = (data: ReceptionFormData) => {
    if (isEditing && reception) {
      updateReception.mutate({ id: reception.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createReception.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createReception.isPending || updateReception.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? text('تعديل الاستقبال', 'Edit Reception')
              : text('إضافة استقبال', 'Add Reception')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{text('الاسم الأول', 'First Name')} *</Label>
              <Input {...register('firstName')} />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{text('اسم العائلة', 'Last Name')} *</Label>
              <Input {...register('lastName')} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{text('رقم الهاتف', 'Phone')} *</Label>
            <Input {...register('phone')} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text('البريد الإلكتروني', 'Email')} *</Label>
            <Input type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {text('إلغاء', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? text('تحديث', 'Update') : text('إضافة', 'Add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
