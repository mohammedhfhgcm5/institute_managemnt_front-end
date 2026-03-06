import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teacherSchema } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCreateTeacher, useUpdateTeacher } from '@/hooks/api/useTeachers';
import { useLocale } from '@/hooks/useLocale';
import { Teacher } from '@/types/teacher.types';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: Teacher | null;
}

export function TeacherForm({ open, onOpenChange, teacher }: TeacherFormProps) {
  const { text } = useLocale();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const isEditing = !!teacher;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });

  useEffect(() => {
    if (teacher) {
      reset({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        specialization: teacher.specialization,
        qualifications: teacher.qualifications,
        experienceYears: teacher.experienceYears,
        bio: teacher.bio || '',
        salary: teacher.salary ?? 0,
        hireDate: teacher.hireDate,
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        specialization: '',
        qualifications: '',
        experienceYears: 0,
        bio: '',
        salary: 0,
        hireDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [teacher, reset]);

  const onSubmit = (data: TeacherFormData) => {
    if (isEditing && teacher) {
      updateTeacher.mutate({ id: teacher.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createTeacher.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createTeacher.isPending || updateTeacher.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? text('تعديل المعلم', 'Edit Teacher') : text('إضافة معلم جديد', 'Add New Teacher')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{text('الاسم الأول', 'First Name')} *</Label>
              <Input {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{text('اسم العائلة', 'Last Name')} *</Label>
              <Input {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{text('التخصص', 'Specialization')} *</Label>
              <Input {...register('specialization')} />
              {errors.specialization && <p className="text-sm text-destructive">{errors.specialization.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{text('المؤهلات', 'Qualifications')} *</Label>
              <Input {...register('qualifications')} />
              {errors.qualifications && <p className="text-sm text-destructive">{errors.qualifications.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{text('سنوات الخبرة', 'Experience Years')} *</Label>
              <Input type="number" {...register('experienceYears', { valueAsNumber: true })} />
              {errors.experienceYears && <p className="text-sm text-destructive">{errors.experienceYears.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{text('الراتب', 'Salary')} *</Label>
              <Input type="number" {...register('salary', { valueAsNumber: true })} />
              {errors.salary && <p className="text-sm text-destructive">{errors.salary.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{text('تاريخ التعيين', 'Hire Date')} *</Label>
              <Input type="date" {...register('hireDate')} />
              {errors.hireDate && <p className="text-sm text-destructive">{errors.hireDate.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{text('نبذة', 'Bio')}</Label>
              <Textarea {...register('bio')} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{text('إلغاء', 'Cancel')}</Button>
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
