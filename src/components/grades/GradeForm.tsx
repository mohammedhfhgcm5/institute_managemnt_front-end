import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useCreateGrade, useUpdateGrade } from '@/hooks/api/useGrades';
import { Grade } from '@/types/grade.types';
import { Loader2 } from 'lucide-react';

const gradeFormSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  level: z.enum(['preparatory', 'secondary']),
  description: z.string().optional().or(z.literal('')),
});

type GradeFormData = z.infer<typeof gradeFormSchema>;

interface GradeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade?: Grade | null;
}

export function GradeForm({ open, onOpenChange, grade }: GradeFormProps) {
  const createGrade = useCreateGrade();
  const updateGrade = useUpdateGrade();
  const isEditing = !!grade;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeFormSchema),
  });

  useEffect(() => {
    if (grade) {
      reset({
        name: grade.name,
        level: grade.level,
        description: grade.description || '',
      });
      return;
    }

    reset({
      name: '',
      level: 'preparatory',
      description: '',
    });
  }, [grade, reset]);

  const onSubmit = (data: GradeFormData) => {
    const payload = {
      name: data.name,
      level: data.level,
      description: data.description || undefined,
    };

    if (isEditing && grade) {
      updateGrade.mutate({ id: grade.id, data: payload }, { onSuccess: () => onOpenChange(false) });
      return;
    }

    createGrade.mutate(payload, { onSuccess: () => onOpenChange(false) });
  };

  const isPending = createGrade.isPending || updateGrade.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Class' : 'Add Class'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Class Name *</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Level *</Label>
            <Select
              value={watch('level')}
              onValueChange={(val) => setValue('level', val as GradeFormData['level'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preparatory">Preparatory</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
            {errors.level && <p className="text-sm text-destructive">{errors.level.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register('description')} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
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
