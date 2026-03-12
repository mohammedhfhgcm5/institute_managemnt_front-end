import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receptionService } from '@/services/reception.service';
import { userService } from '@/services/user.service';
import { PaginationParams } from '@/types/common.types';
import { CreateReceptionData, UpdateReceptionData } from '@/types/reception.types';
import { CreateUserData } from '@/types/user.types';
import { localize } from '@/i18n/localize';
import { toast } from 'sonner';

export const receptionKeys = {
  all: ['reception'] as const,
  lists: () => [...receptionKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...receptionKeys.lists(), params] as const,
  details: () => [...receptionKeys.all, 'detail'] as const,
  detail: (id: number) => [...receptionKeys.details(), id] as const,
};

export const useReceptions = (params?: PaginationParams) => {
  return useQuery({
    queryKey: receptionKeys.list(params),
    queryFn: () => receptionService.getAll(params),
  });
};

export const useReception = (id: number) => {
  return useQuery({
    queryKey: receptionKeys.detail(id),
    queryFn: () => receptionService.getById(id),
    enabled: !!id,
  });
};

export const useCreateReception = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReceptionData) => receptionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receptionKeys.lists() });
      toast.success(localize('تم إضافة الاستقبال بنجاح', 'Reception created successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('Something went wrong', 'Something went wrong'));
    },
  });
};

export const useUpdateReception = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReceptionData }) =>
      receptionService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: receptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receptionKeys.detail(variables.id) });
      toast.success(localize('تم تحديث بيانات الاستقبال بنجاح', 'Reception updated successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('Something went wrong', 'Something went wrong'));
    },
  });
};

export const useDeleteReception = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => receptionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receptionKeys.lists() });
      toast.success(localize('تم حذف الاستقبال بنجاح', 'Reception deleted successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('Something went wrong', 'Something went wrong'));
    },
  });
};

export const useCreateReceptionAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserData) => userService.createReceptionAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receptionKeys.lists() });
      toast.success(
        localize('تم إنشاء حساب الاستقبال بنجاح', 'Reception account created successfully')
      );
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('Something went wrong', 'Something went wrong'));
    },
  });
};
