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
import { useLocale } from '@/hooks/useLocale';
import { getStatusLabel, formatDate } from '@/utils/formatters';
import { Loader2, User, Shield, Calendar } from 'lucide-react';
import { z } from 'zod';

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const changePassword = useChangePassword();
  const { text } = useLocale();

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
      <h1 className="text-2xl font-bold">{text('الملف الشخصي', 'Profile')}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {text('معلومات الحساب', 'Account information')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm w-32">
                  {text('البريد الإلكتروني:', 'Email:')}
                </span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm w-28">
                  {text('الصلاحية:', 'Role:')}
                </span>
                <span className="font-medium">{user?.role ? getStatusLabel(user.role) : ''}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm w-28">
                  {text('تاريخ الإنشاء:', 'Created at:')}
                </span>
                <span className="font-medium">
                  {user?.createdAt ? formatDate(user.createdAt) : ''}
                </span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm w-32">
                  {text('رقم الهاتف:', 'Phone:')}
                </span>
                <span className="font-medium">{user?.phone || text('غير محدد', 'Not set')}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm w-32">
                  {text('الحالة:', 'Status:')}
                </span>
                <span className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.isActive ? text('نشط', 'Active') : text('غير نشط', 'Inactive')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{text('تغيير كلمة المرور', 'Change password')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>{text('كلمة المرور الحالية', 'Current password')}</Label>
                <Input type="password" {...register('currentPassword')} />
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{text('كلمة المرور الجديدة', 'New password')}</Label>
                <Input type="password" {...register('newPassword')} />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{text('تأكيد كلمة المرور', 'Confirm password')}</Label>
                <Input type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={changePassword.isPending} className="gap-2">
                {changePassword.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {text('تغيير كلمة المرور', 'Change password')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
