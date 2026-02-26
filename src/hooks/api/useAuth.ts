import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { LoginCredentials, ChangePasswordData } from '@/types/auth.types';
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
      toast.success('تم تسجيل الدخول بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'فشل تسجيل الدخول');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'فشل تغيير كلمة المرور');
    },
  });
};