import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parentSchema } from '@/utils/validators';
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
import { useCreateParent, useUpdateParent } from '@/hooks/api/useParents';
import { Parent } from '@/types/parent.types';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type ParentFormData = z.infer<typeof parentSchema>;

interface ParentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent?: Parent | null;
}

export function ParentForm({ open, onOpenChange, parent }: ParentFormProps) {
  const createParent = useCreateParent();
  const updateParent = useUpdateParent();
  const isEditing = !!parent;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
  });

  useEffect(() => {
    if (parent) {
      reset({
        firstName: parent.firstName,
        lastName: parent.lastName,
        phone: parent.phone,
        email: parent.email || '',
        address: parent.address || '',
        relationship: parent.relationship,
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        relationship: 'father',
      });
    }
  }, [parent, reset]);

  const onSubmit = (data: ParentFormData) => {
    if (isEditing && parent) {
      updateParent.mutate({ id: parent.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createParent.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createParent.isPending || updateParent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'تعديل ولي الأمر' : 'إضافة ولي أمر'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label>رقم الهاتف *</Label>
            <Input {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>نوع العلاقة *</Label>
            <Select
              value={watch('relationship')}
              onValueChange={(value) => setValue('relationship', value as ParentFormData['relationship'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="father">أب</SelectItem>
                <SelectItem value="mother">أم</SelectItem>
                <SelectItem value="guardian">ولي أمر</SelectItem>
              </SelectContent>
            </Select>
            {errors.relationship && (
              <p className="text-sm text-destructive">{errors.relationship.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input {...register('address')} />
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