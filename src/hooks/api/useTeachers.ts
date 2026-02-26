import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '@/services/teacher.service';
import { PaginationParams } from '@/types/common.types';
import { CreateTeacherData, UpdateTeacherData } from '@/types/teacher.types';
import { toast } from 'sonner';

export const teacherKeys = {
  all: ['teachers'] as const,
  lists: () => [...teacherKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...teacherKeys.lists(), params] as const,
  details: () => [...teacherKeys.all, 'detail'] as const,
  detail: (id: number) => [...teacherKeys.details(), id] as const,
};

export const useTeachers = (params?: PaginationParams) => {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: () => teacherService.getAll(params),
  });
};

export const useTeacher = (id: number) => {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => teacherService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeacherData) => teacherService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      toast.success('تم إضافة المعلم بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTeacherData }) =>
      teacherService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(variables.id) });
      toast.success('تم تحديث بيانات المعلم بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      toast.success('تم حذف المعلم بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};