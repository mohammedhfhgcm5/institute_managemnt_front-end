import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCreatePayment, useUpdatePayment } from '@/hooks/api/usePayments';
import { Payment } from '@/types/payment.types';
import { ACADEMIC_YEARS } from '@/utils/constants';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
}

export function PaymentForm({ open, onOpenChange, payment }: PaymentFormProps) {
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const isEditing = !!payment;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    if (payment) {
      reset({
        studentId: payment.studentId,
        academicYear: payment.academicYear,
        amount: payment.amount,
        discount: payment.discount,
        status: payment.status,
        dueDate: payment.dueDate,
        paymentDate: payment.paymentDate || '',
        notes: payment.notes || '',
      });
    } else {
      reset({
        studentId: 0,
        academicYear: ACADEMIC_YEARS[0],
        amount: 0,
        discount: 0,
        status: 'pending',
        dueDate: '',
        paymentDate: '',
        notes: '',
      });
    }
  }, [payment, reset]);

  const onSubmit = (data: PaymentFormData) => {
    if (isEditing && payment) {
      updatePayment.mutate({ id: payment.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createPayment.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createPayment.isPending || updatePayment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Student ID *</Label>
              <Input type="number" {...register('studentId', { valueAsNumber: true })} />
              {errors.studentId && <p className="text-sm text-destructive">{errors.studentId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Academic Year *</Label>
              <Select value={watch('academicYear')} onValueChange={(val) => setValue('academicYear', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.academicYear && <p className="text-sm text-destructive">{errors.academicYear.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input type="number" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Discount</Label>
              <Input type="number" {...register('discount', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={watch('status')} onValueChange={(val) => setValue('status', val as PaymentFormData['status'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" {...register('dueDate')} />
              {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" {...register('paymentDate')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...register('notes')} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
