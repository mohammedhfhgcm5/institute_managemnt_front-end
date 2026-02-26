import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { PaginationParams } from '@/types/common.types';
import { CreatePaymentData, UpdatePaymentData } from '@/types/payment.types';
import { toast } from 'sonner';

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: number) => [...paymentKeys.details(), id] as const,
  byStudent: (studentId: number) =>
    [...paymentKeys.all, 'student', studentId] as const,
  stats: () => [...paymentKeys.all, 'stats'] as const,
};

export const usePayments = (params?: PaginationParams) => {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentService.getAll(params),
  });
};

export const usePayment = (id: number) => {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentService.getById(id),
    enabled: !!id,
  });
};

export const usePaymentsByStudent = (studentId: number) => {
  return useQuery({
    queryKey: paymentKeys.byStudent(studentId),
    queryFn: () => paymentService.getByStudent(studentId),
    enabled: !!studentId,
  });
};

export const usePaymentStats = () => {
  return useQuery({
    queryKey: paymentKeys.stats(),
    queryFn: () => paymentService.getStats(),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentData) => paymentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
      toast.success('تم إضافة الدفعة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePaymentData }) =>
      paymentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
      toast.success('تم تحديث الدفعة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paymentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
      toast.success('تم حذف الدفعة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};