import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '@/services/expense.service';
import { PaginationParams } from '@/types/common.types';
import { CreateExpenseData, UpdateExpenseData } from '@/types/expense.types';
import { localize } from '@/i18n/localize';
import { toast } from 'sonner';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: number) => [...expenseKeys.details(), id] as const,
  stats: () => [...expenseKeys.all, 'stats'] as const,
};

export const useExpenses = (params?: PaginationParams) => {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expenseService.getAll(params),
  });
};

export const useExpense = (id: number) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expenseService.getById(id),
    enabled: !!id,
  });
};

export const useExpenseStats = () => {
  return useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: () => expenseService.getStats(),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      toast.success(localize('تم إضافة المصروف بنجاح', 'Expense created successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseData }) =>
      expenseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      toast.success(localize('تم تحديث المصروف بنجاح', 'Expense updated successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      toast.success(localize('تم حذف المصروف بنجاح', 'Expense deleted successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};
