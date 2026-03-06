import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLogin } from '@/hooks/api/useAuth';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/hooks/useLocale';
import { Loader2, GraduationCap } from 'lucide-react';
import { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const loginMutation = useLogin();
  const { login } = useAuth();
  const { text } = useLocale();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        login(response.accessToken, response.user);
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {text('نظام إدارة المدرسة', 'School Management System')}
          </CardTitle>
          <CardDescription>
            {text(
              'قم بتسجيل الدخول للوصول إلى لوحة التحكم',
              'Sign in to access the dashboard'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{text('البريد الإلكتروني', 'Email')}</Label>
              <Input
                type="email"
                placeholder="admin@school.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{text('كلمة المرور', 'Password')}</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              <span className="inline-flex items-center gap-2">
                {loginMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {text('تسجيل الدخول', 'Login')}
              </span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
