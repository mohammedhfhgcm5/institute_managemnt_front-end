import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/course.service';
import { PaginationParams } from '@/types/common.types';
import { CreateCourseData, UpdateCourseData } from '@/types/course.types';
import { localize } from '@/i18n/localize';
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
      toast.success(localize('تم إضافة المادة بنجاح', 'Subject created successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
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
      toast.success(localize('تم تحديث المادة بنجاح', 'Subject updated successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success(localize('تم حذف المادة بنجاح', 'Subject deleted successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};
