import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '@/utils/validators';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useChangePassword } from '@/hooks/api/useAuth';
import { getStatusLabel, formatDate } from '@/utils/formatters';
import { Loader2, User, Shield, Calendar } from 'lucide-react';
import { z } from 'zod';

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => reset() }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الملف الشخصي</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              معلومات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm w-32">البريد الإلكتروني:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm w-28">الصلاحية:</span>
                <span className="font-medium">{user?.role ? getStatusLabel(user.role) : ''}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm w-28">تاريخ الإنشاء:</span>
                <span className="font-medium">
                  {user?.createdAt ? formatDate(user.createdAt) : ''}
                </span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm w-32">رقم الهاتف:</span>
                <span className="font-medium">{user?.phone || 'غير محدد'}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm w-32">الحالة:</span>
                <span className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تغيير كلمة المرور</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>كلمة المرور الحالية</Label>
                <Input type="password" {...register('currentPassword')} />
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور الجديدة</Label>
                <Input type="password" {...register('newPassword')} />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>تأكيد كلمة المرور</Label>
                <Input type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                تغيير كلمة المرور
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}