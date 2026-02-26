import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useCreateStudent, useUpdateStudent } from '@/hooks/api/useStudents';
import { useParents } from '@/hooks/api/useParents';
import { useSections } from '@/hooks/api/useSections';
import { Student } from '@/types/student.types';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
}

export function StudentForm({ open, onOpenChange, student }: StudentFormProps) {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const { data: parentsData } = useParents({ limit: 100 });
  const { data: sectionsData } = useSections({ limit: 100 });
  const isEditing = !!student;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: 'male',
      status: 'active',
      parentId: undefined,
      sectionId: undefined,
      academicYear: '',
      address: '',
    },
  });

  useEffect(() => {
    if (student) {
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        parentId: student.parentId,
        sectionId: student.sectionId,
        academicYear: student.academicYear || '',
        address: student.address || '',
        status: student.status,
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        parentId: undefined,
        sectionId: undefined,
        academicYear: '',
        address: '',
        status: 'active',
      });
    }
  }, [student, reset]);

  const onSubmit = (data: StudentFormData) => {
    if (isEditing && student) {
      updateStudent.mutate({ id: student.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createStudent.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createStudent.isPending || updateStudent.isPending;
  const parents = parentsData?.data || [];
  const sections = sectionsData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'تعديل الطالب' : 'إضافة طالب'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>الاسم الأول *</Label>
              <Input {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>اسم العائلة *</Label>
              <Input {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>تاريخ الميلاد *</Label>
              <Input type="date" {...register('dateOfBirth')} />
              {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>الجنس *</Label>
              <Select value={watch('gender')} onValueChange={(val) => setValue('gender', val as 'male' | 'female')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>ولي الأمر</Label>
              <Select
                value={watch('parentId') ? String(watch('parentId')) : undefined}
                onValueChange={(val) => setValue('parentId', Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر ولي الأمر" />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={String(parent.id)}>
                      {parent.firstName} {parent.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الشعبة</Label>
              <Select
                value={watch('sectionId') ? String(watch('sectionId')) : undefined}
                onValueChange={(val) => setValue('sectionId', Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشعبة" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={String(section.id)}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>السنة الدراسية</Label>
              <Select
                value={watch('academicYear') || ''}
                onValueChange={(val) => setValue('academicYear', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر السنة الدراسية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الأول ابتدائي">الأول ابتدائي</SelectItem>
                  <SelectItem value="الثاني ابتدائي">الثاني ابتدائي</SelectItem>
                  <SelectItem value="الثالث ابتدائي">الثالث ابتدائي</SelectItem>
                  <SelectItem value="الرابع ابتدائي">الرابع ابتدائي</SelectItem>
                  <SelectItem value="الخامس ابتدائي">الخامس ابتدائي</SelectItem>
                  <SelectItem value="السادس ابتدائي">السادس ابتدائي</SelectItem>
                  <SelectItem value="الأول متوسط">الأول متوسط</SelectItem>
                  <SelectItem value="الثاني متوسط">الثاني متوسط</SelectItem>
                  <SelectItem value="الثالث متوسط">الثالث متوسط</SelectItem>
                  <SelectItem value="الأول ثانوي">الأول ثانوي</SelectItem>
                  <SelectItem value="الثاني ثانوي">الثاني ثانوي</SelectItem>
                  <SelectItem value="الثالث ثانوي">الثالث ثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={watch('status') || 'active'}
                onValueChange={(val) => setValue('status', val as StudentFormData['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="graduated">متخرج</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>العنوان</Label>
              <Input {...register('address')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
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