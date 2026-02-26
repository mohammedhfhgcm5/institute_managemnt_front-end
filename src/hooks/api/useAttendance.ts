import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance.service';
import { PaginationParams } from '@/types/common.types';
import { CreateAttendanceData, UpdateAttendanceData } from '@/types/attendance.types';
import { toast } from 'sonner';

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...attendanceKeys.lists(), params] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: number) => [...attendanceKeys.details(), id] as const,
  stats: (params?: Record<string, string>) =>
    [...attendanceKeys.all, 'stats', params] as const,
};

export const useAttendanceList = (params?: PaginationParams) => {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceService.getAll(params),
  });
};

export const useAttendanceStats = (params?: Record<string, string>) => {
  const hasStudentId = !!params?.studentId;
  return useQuery({
    queryKey: attendanceKeys.stats(params),
    queryFn: () => attendanceService.getStats(params),
    enabled: hasStudentId,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttendanceData) => attendanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });
      toast.success('تم تسجيل الحضور بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAttendanceData }) =>
      attendanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });
      toast.success('تم تحديث الحضور بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => attendanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      toast.success('تم حذف سجل الحضور بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};
