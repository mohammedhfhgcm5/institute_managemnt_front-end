import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notificationSchema } from "@/utils/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateNotification } from "@/hooks/api/useNotifications";
import { useLocale } from "@/hooks/useLocale";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type NotificationFormData = z.infer<typeof notificationSchema>;

interface NotificationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationForm({
  open,
  onOpenChange,
}: NotificationFormProps) {
  const { text } = useLocale();
  const createNotification = useCreateNotification();
  const defaultValues: Partial<NotificationFormData> = {
    type: "info",
    channel: "in_app",
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues,
  });

  const onSubmit = (data: NotificationFormData) => {
    if (!data.recipientId || data.recipientId < 1) {
      toast.error(text("يرجى إدخال رقم مستخدم صالح", "Please enter a valid user ID"));
      return;
    }

    createNotification.mutate(
      {
        userId: data.recipientId,
        title: data.title,
        message: data.message,
        type: data.type,
        channel: data.channel,
      },
      {
        onSuccess: () => {
          reset(defaultValues);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{text("إرسال إشعار", "Send Notification")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{text("رقم المستخدم", "User ID")}</Label>
            <Input
              type="number"
              min={1}
              {...register("recipientId", {
                valueAsNumber: true,
                setValueAs: (value) =>
                  value === "" ? undefined : Number(value),
              })}
              placeholder={text("مثال: 12", "Example: 12")}
            />
            {errors.recipientId && (
              <p className="text-sm text-destructive">
                {errors.recipientId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text("العنوان", "Title")}</Label>
            <Input {...register("title")} placeholder={text("عنوان الإشعار", "Notification title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text("الرسالة", "Message")}</Label>
            <Textarea
              {...register("message")}
              placeholder={text("محتوى الإشعار", "Notification content")}
              rows={3}
            />
            {errors.message && (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text("النوع", "Type")}</Label>
            <Select
              value={watch("type")}
              onValueChange={(val) =>
                setValue("type", val as NotificationFormData["type"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={text("اختر النوع", "Select type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">{text("معلومات", "Info")}</SelectItem>
                <SelectItem value="warning">{text("تحذير", "Warning")}</SelectItem>
                <SelectItem value="alert">{text("تنبيه", "Alert")}</SelectItem>
                <SelectItem value="success">{text("نجاح", "Success")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text("القناة", "Channel")}</Label>
            <Select
              value={watch("channel")}
              onValueChange={(val) =>
                setValue("channel", val as NotificationFormData["channel"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={text("اختر القناة", "Select channel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_app">{text("داخل التطبيق", "In app")}</SelectItem>
                <SelectItem value="email">{text("بريد إلكتروني", "Email")}</SelectItem>
                <SelectItem value="sms">{text("رسالة نصية", "SMS")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.channel && (
              <p className="text-sm text-destructive">
                {errors.channel.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {text("إلغاء", "Cancel")}
            </Button>
            <Button type="submit" disabled={createNotification.isPending}>
              {createNotification.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              {text("إرسال", "Send")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
