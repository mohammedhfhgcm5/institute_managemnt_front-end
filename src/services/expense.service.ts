import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import {
  Expense,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseStats,
} from '@/types/expense.types';

export const expenseService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Expense>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Expense>>>(
      ENDPOINTS.EXPENSES,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Expense> => {
    const response = await apiClient.get<ApiResponse<Expense>>(
      ENDPOINTS.EXPENSE_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await apiClient.post<ApiResponse<Expense>>(
      ENDPOINTS.EXPENSES,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateExpenseData): Promise<Expense> => {
    const response = await apiClient.patch<ApiResponse<Expense>>(
      ENDPOINTS.EXPENSE_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.EXPENSE_BY_ID(id));
  },

  getStats: async (): Promise<ExpenseStats> => {
    const response = await apiClient.get<ApiResponse<ExpenseStats>>(
      ENDPOINTS.EXPENSE_STATS
    );
    return response.data.data;
  },
};