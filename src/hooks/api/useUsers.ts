import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { PaginationParams } from '@/types/common.types';
import { CreateUserData, UpdateUserData } from '@/types/user.types';
import { localize } from '@/i18n/localize';
import { toast } from 'sonner';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export const useUsers = (params?: PaginationParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getAll(params),
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserData) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(localize('تم إنشاء المستخدم بنجاح', 'User created successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      toast.success(localize('تم تحديث المستخدم بنجاح', 'User updated successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(localize('تم حذف المستخدم بنجاح', 'User deleted successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};
