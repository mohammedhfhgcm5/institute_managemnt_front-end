import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { LoginCredentials, ChangePasswordData } from '@/types/auth.types';
import { localize } from '@/i18n/localize';
import { toast } from 'sonner';

export const authKeys = {
  profile: ['auth', 'profile'] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => authService.getProfile(),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      queryClient.setQueryData(authKeys.profile, data.user);
      toast.success(localize('تم تسجيل الدخول بنجاح', 'Logged in successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('فشل تسجيل الدخول', 'Login failed'));
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => authService.changePassword(data),
    onSuccess: () => {
      toast.success(localize('تم تغيير كلمة المرور بنجاح', 'Password changed successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('فشل تغيير كلمة المرور', 'Failed to change password'));
    },
  });
};
