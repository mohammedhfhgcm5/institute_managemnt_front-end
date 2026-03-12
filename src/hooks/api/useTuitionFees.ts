import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tuitionFeeService, TuitionFeeListParams } from '@/services/tuition-fee.service';
import { CreateTuitionFeeData, UpdateTuitionFeeData } from '@/types/tuition-fee.types';
import { localize } from '@/i18n/localize';
import { toast } from 'sonner';

export const tuitionFeeKeys = {
  all: ['tuition-fees'] as const,
  lists: () => [...tuitionFeeKeys.all, 'list'] as const,
  list: (params?: TuitionFeeListParams) => [...tuitionFeeKeys.lists(), params] as const,
  details: () => [...tuitionFeeKeys.all, 'detail'] as const,
  detail: (id: number) => [...tuitionFeeKeys.details(), id] as const,
  byGrade: (gradeId: number, academicYear?: string) =>
    [...tuitionFeeKeys.all, 'grade', gradeId, academicYear] as const,
  studentBalance: (studentId: number, academicYear: string) =>
    [...tuitionFeeKeys.all, 'student-balance', studentId, academicYear] as const,
};

export const useTuitionFees = (params?: TuitionFeeListParams) => {
  return useQuery({
    queryKey: tuitionFeeKeys.list(params),
    queryFn: () => tuitionFeeService.getAll(params),
  });
};

export const useTuitionFee = (id: number) => {
  return useQuery({
    queryKey: tuitionFeeKeys.detail(id),
    queryFn: () => tuitionFeeService.getById(id),
    enabled: !!id,
  });
};

export const useTuitionFeeByGrade = (gradeId: number, academicYear?: string) => {
  return useQuery({
    queryKey: tuitionFeeKeys.byGrade(gradeId, academicYear),
    queryFn: () => tuitionFeeService.getByGrade(gradeId, academicYear),
    enabled: !!gradeId,
  });
};

export const useStudentTuitionBalance = (studentId: number, academicYear: string) => {
  return useQuery({
    queryKey: tuitionFeeKeys.studentBalance(studentId, academicYear),
    queryFn: () => tuitionFeeService.getStudentBalance(studentId, academicYear),
    enabled: !!studentId && !!academicYear,
  });
};

export const useCreateTuitionFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTuitionFeeData) => tuitionFeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tuitionFeeKeys.lists() });
      toast.success(localize('تم إضافة القسط بنجاح', 'Tuition fee created successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useUpdateTuitionFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTuitionFeeData }) =>
      tuitionFeeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tuitionFeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tuitionFeeKeys.detail(variables.id) });
      toast.success(localize('تم تحديث القسط بنجاح', 'Tuition fee updated successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useDeleteTuitionFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tuitionFeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tuitionFeeKeys.lists() });
      toast.success(localize('تم حذف القسط بنجاح', 'Tuition fee deleted successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};