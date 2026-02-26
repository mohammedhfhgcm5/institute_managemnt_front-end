import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notificationSchema } from '@/utils/validators';
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
import { useCreateNotification } from '@/hooks/api/useNotifications';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type NotificationFormData = z.infer<typeof notificationSchema>;

interface NotificationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationForm({ open, onOpenChange }: NotificationFormProps) {
  const createNotification = useCreateNotification();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
  });

  const onSubmit = (data: NotificationFormData) => {
    createNotification.mutate(
      {
        userId: data.recipientId ?? 0,
        title: data.title,
        message: data.message,
        type: data.type,
        channel: data.channel,
      },
      {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إرسال إشعار</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input {...register('title')} placeholder="عنوان الإشعار" />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>الرسالة</Label>
            <Textarea {...register('message')} placeholder="محتوى الإشعار" rows={3} />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>النوع</Label>
            <Select onValueChange={(val) => setValue('type', val as NotificationFormData['type'])}>
              <SelectTrigger>
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">معلومات</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="alert">تنبيه</SelectItem>
                <SelectItem value="success">نجاح</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>القناة</Label>
            <Select onValueChange={(val) => setValue('channel', val as NotificationFormData['channel'])}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القناة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_app">داخل التطبيق</SelectItem>
                <SelectItem value="email">بريد إلكتروني</SelectItem>
                <SelectItem value="sms">رسالة نصية</SelectItem>
              </SelectContent>
            </Select>
            {errors.channel && (
              <p className="text-sm text-destructive">{errors.channel.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={createNotification.isPending}>
              {createNotification.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              إرسال
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
