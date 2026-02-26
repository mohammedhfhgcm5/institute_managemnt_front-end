import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/course.service';
import { PaginationParams } from '@/types/common.types';
import { CreateCourseData, UpdateCourseData } from '@/types/course.types';
import { toast } from 'sonner';

export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: number) => [...courseKeys.details(), id] as const,
};

export const useCourses = (params?: PaginationParams) => {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => courseService.getAll(params),
  });
};

export const useCourse = (id: number) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseData) => courseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success('تم إضافة المادة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseData }) =>
      courseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      toast.success('تم تحديث المادة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success('تم حذف المادة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};