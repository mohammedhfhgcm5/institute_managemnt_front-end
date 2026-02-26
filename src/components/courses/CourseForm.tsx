import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useCreateCourse, useUpdateCourse } from '@/hooks/api/useCourses';
import { Course } from '@/types/course.types';
import { Loader2 } from 'lucide-react';

const courseFormSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  description: z.string().optional().or(z.literal('')),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
}

export function CourseForm({ open, onOpenChange, course }: CourseFormProps) {
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const isEditing = !!course;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
  });

  useEffect(() => {
    if (course) {
      reset({
        name: course.name,
        description: course.description || '',
      });
      return;
    }

    reset({
      name: '',
      description: '',
    });
  }, [course, reset]);

  const onSubmit = (data: CourseFormData) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
    };

    if (isEditing && course) {
      updateCourse.mutate({ id: course.id, data: payload }, { onSuccess: () => onOpenChange(false) });
      return;
    }

    createCourse.mutate(payload, { onSuccess: () => onOpenChange(false) });
  };

  const isPending = createCourse.isPending || updateCourse.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Course' : 'Add Course'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Course Name *</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register('description')} rows={3} />
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
