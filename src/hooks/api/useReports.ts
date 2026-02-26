import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { PaginationParams } from '@/types/common.types';
import { CreateReportData } from '@/types/report.types';
import { toast } from 'sonner';

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...reportKeys.lists(), params] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: number) => [...reportKeys.details(), id] as const,
};

export const useReports = (params?: PaginationParams) => {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => reportService.getAll(params),
  });
};

export const useReport = (id: number) => {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportService.getById(id),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReportData) => reportService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reportService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      toast.success('تم حذف التقرير بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};