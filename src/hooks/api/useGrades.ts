import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeService } from '@/services/grade.service';
import { PaginationParams } from '@/types/common.types';
import { CreateGradeData, UpdateGradeData } from '@/types/grade.types';
import { toast } from 'sonner';

export const gradeKeys = {
  all: ['grades'] as const,
  lists: () => [...gradeKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...gradeKeys.lists(), params] as const,
  details: () => [...gradeKeys.all, 'detail'] as const,
  detail: (id: number) => [...gradeKeys.details(), id] as const,
  stats: (params?: Record<string, string>) => [...gradeKeys.all, 'stats', params] as const,
};

export const useGrades = (params?: PaginationParams) => {
  return useQuery({
    queryKey: gradeKeys.list(params),
    queryFn: () => gradeService.getAll(params),
  });
};

export const useGrade = (id: number) => {
  return useQuery({
    queryKey: gradeKeys.detail(id),
    queryFn: () => gradeService.getById(id),
    enabled: !!id,
  });
};

export const useGradeStats = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: gradeKeys.stats(params),
    queryFn: () => gradeService.getStats(params),
  });
};

export const useCreateGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGradeData) => gradeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
      toast.success('Class created successfully');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useUpdateGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGradeData }) =>
      gradeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gradeKeys.detail(variables.id) });
      toast.success('Class updated successfully');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useDeleteGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gradeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
      toast.success('Class deleted successfully');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });
};
