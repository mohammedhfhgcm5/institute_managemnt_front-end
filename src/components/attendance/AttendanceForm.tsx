import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { attendanceSchema } from '@/utils/validators';
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
import { useCreateAttendance, useUpdateAttendance } from '@/hooks/api/useAttendance';
import { Attendance } from '@/types/attendance.types';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance?: Attendance | null;
}

export function AttendanceForm({ open, onOpenChange, attendance }: AttendanceFormProps) {
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const isEditing = !!attendance;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
  });

  useEffect(() => {
    if (attendance) {
      reset({
        studentId: attendance.studentId,
        courseId: attendance.scheduleId ?? 0,
        date: attendance.date,
        status: attendance.status,
        notes: attendance.notes || '',
      });
    } else {
      reset({
        studentId: 0,
        courseId: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        notes: '',
      });
    }
  }, [attendance, reset]);

  const onSubmit = (data: AttendanceFormData) => {
    const payload = {
      studentId: data.studentId,
      scheduleId: data.courseId,
      date: data.date,
      status: data.status,
      notes: data.notes,
    };

    if (isEditing && attendance) {
      updateAttendance.mutate(
        { id: attendance.id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createAttendance.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createAttendance.isPending || updateAttendance.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'تعديل الحضور' : 'تسجيل حضور'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>رقم الطالب *</Label>
              <Input type="number" {...register('studentId', { valueAsNumber: true })} />
              {errors.studentId && <p className="text-sm text-destructive">{errors.studentId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>رقم المادة *</Label>
              <Input type="number" {...register('courseId', { valueAsNumber: true })} />
              {errors.courseId && <p className="text-sm text-destructive">{errors.courseId.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>التاريخ *</Label>
            <Input type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>الحالة *</Label>
            <Select value={watch('status')} onValueChange={(val) => setValue('status', val as AttendanceFormData['status'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="present">حاضر</SelectItem>
                <SelectItem value="absent">غائب</SelectItem>
                <SelectItem value="late">متأخر</SelectItem>
                <SelectItem value="excused">معذور</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea {...register('notes')} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'تحديث' : 'تسجيل'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
