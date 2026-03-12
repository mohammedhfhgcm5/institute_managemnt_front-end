import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tuitionFeeSchema } from '@/utils/validators';
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
import { useCreateTuitionFee, useUpdateTuitionFee } from '@/hooks/api/useTuitionFees';
import { useGrades } from '@/hooks/api/useGrades';
import { useLocale } from '@/hooks/useLocale';
import { TuitionFee } from '@/types/tuition-fee.types';
import { Loader2 } from 'lucide-react';

const defaultValues = {
  gradeId: 0,
  academicYear: '',
  annualAmount: 0,
  description: '',
};

type TuitionFeeFormData = z.infer<typeof tuitionFeeSchema>;

interface TuitionFeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee?: TuitionFee | null;
}

export function TuitionFeeForm({ open, onOpenChange, fee }: TuitionFeeFormProps) {
  const { text } = useLocale();
  const createTuitionFee = useCreateTuitionFee();
  const updateTuitionFee = useUpdateTuitionFee();
  const isEditing = !!fee;

  const { data: gradesData, isLoading: isGradesLoading } = useGrades({
    page: 1,
    limit: 100,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TuitionFeeFormData>({
    resolver: zodResolver(tuitionFeeSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (fee) {
      reset({
        gradeId: fee.gradeId,
        academicYear: fee.academicYear,
        annualAmount: fee.annualAmount,
        description: fee.description || '',
      });
      return;
    }

    reset(defaultValues);
  }, [fee, open, reset]);

  const onSubmit = (data: TuitionFeeFormData) => {
    const payload = {
      gradeId: data.gradeId,
      academicYear: data.academicYear,
      annualAmount: data.annualAmount,
      description: data.description || undefined,
    };

    const onSuccess = () => {
      reset(defaultValues);
      onOpenChange(false);
    };

    if (isEditing && fee) {
      updateTuitionFee.mutate({ id: fee.id, data: payload }, { onSuccess });
      return;
    }

    createTuitionFee.mutate(payload, { onSuccess });
  };

  const isPending = createTuitionFee.isPending || updateTuitionFee.isPending;
  const grades = gradesData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? text('تعديل القسط', 'Edit Tuition Fee')
              : text('إضافة قسط', 'Add Tuition Fee')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{text('الصف', 'Grade')} *</Label>
            <Select
              value={watch('gradeId') ? String(watch('gradeId')) : undefined}
              onValueChange={(val) =>
                setValue('gradeId', Number(val), { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isGradesLoading
                      ? text('جاري تحميل الصفوف...', 'Loading grades...')
                      : text('اختر الصف', 'Select grade')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={String(grade.id)}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gradeId && (
              <p className="text-sm text-destructive">{errors.gradeId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text('السنة الدراسية', 'Academic Year')} *</Label>
            <Input
              {...register('academicYear')}
              placeholder="2025-2026"
            />
            {errors.academicYear && (
              <p className="text-sm text-destructive">{errors.academicYear.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text('المبلغ السنوي', 'Annual Amount')} *</Label>
            <Input
              type="number"
              min={0}
              {...register('annualAmount', {
                setValueAs: (value) => (value === '' ? 0 : Number(value)),
              })}
            />
            {errors.annualAmount && (
              <p className="text-sm text-destructive">{errors.annualAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text('ملاحظات', 'Notes')}</Label>
            <Textarea {...register('description')} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {text('إلغاء', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? text('تحديث', 'Update') : text('إنشاء', 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
