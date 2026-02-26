import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentService } from '@/services/parent.service';
import { PaginationParams } from '@/types/common.types';
import { CreateParentData, UpdateParentData } from '@/types/parent.types';
import { toast } from 'sonner';

export const parentKeys = {
  all: ['parents'] as const,
  lists: () => [...parentKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...parentKeys.lists(), params] as const,
  details: () => [...parentKeys.all, 'detail'] as const,
  detail: (id: number) => [...parentKeys.details(), id] as const,
};

export const useParents = (params?: PaginationParams) => {
  return useQuery({
    queryKey: parentKeys.list(params),
    queryFn: () => parentService.getAll(params),
  });
};

export const useParent = (id: number) => {
  return useQuery({
    queryKey: parentKeys.detail(id),
    queryFn: () => parentService.getById(id),
    enabled: !!id,
  });
};

export const useCreateParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateParentData) => parentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentKeys.lists() });
      toast.success('تم إضافة ولي الأمر بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useUpdateParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateParentData }) =>
      parentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: parentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: parentKeys.detail(variables.id) });
      toast.success('تم تحديث بيانات ولي الأمر بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useDeleteParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => parentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentKeys.lists() });
      toast.success('تم حذف ولي الأمر بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};