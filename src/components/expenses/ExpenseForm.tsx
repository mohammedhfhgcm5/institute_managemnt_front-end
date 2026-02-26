import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema } from '@/utils/validators';
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
import { useCreateExpense, useUpdateExpense } from '@/hooks/api/useExpenses';
import { Expense } from '@/types/expense.types';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const isEditing = !!expense;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.description,
        description: expense.description || '',
        amount: expense.amount,
        category: expense.category,
        date: expense.expenseDate,
        receipt: expense.receiptNumber || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        amount: 0,
        category: 'other',
        date: new Date().toISOString().split('T')[0],
        receipt: '',
      });
    }
  }, [expense, reset]);

  const onSubmit = (data: ExpenseFormData) => {
    const payload = {
      category: data.category,
      description: data.description || data.title,
      amount: data.amount,
      expenseDate: data.date,
      receiptNumber: data.receipt || undefined,
    };

    if (isEditing && expense) {
      updateExpense.mutate({ id: expense.id, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createExpense.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createExpense.isPending || updateExpense.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'تعديل المصروف' : 'إضافة مصروف'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>العنوان *</Label>
            <Input {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المبلغ *</Label>
              <Input type="number" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>التصنيف *</Label>
              <Select value={watch('category')} onValueChange={(val) => setValue('category', val as ExpenseFormData['category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">رواتب</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                  <SelectItem value="supplies">مستلزمات</SelectItem>
                  <SelectItem value="utilities">مرافق</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>التاريخ *</Label>
            <Input type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea {...register('description')} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
