import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import {
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  PaymentStats,
} from '@/types/payment.types';

export const paymentService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Payment>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Payment>>>(
      ENDPOINTS.PAYMENTS,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Payment> => {
    const response = await apiClient.get<ApiResponse<Payment>>(
      ENDPOINTS.PAYMENT_BY_ID(id)
    );
    return response.data.data;
  },

  getByStudent: async (studentId: number): Promise<Payment[]> => {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      ENDPOINTS.PAYMENTS_BY_STUDENT(studentId)
    );
    return response.data.data;
  },

  create: async (data: CreatePaymentData): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>(
      ENDPOINTS.PAYMENTS,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdatePaymentData): Promise<Payment> => {
    const response = await apiClient.patch<ApiResponse<Payment>>(
      ENDPOINTS.PAYMENT_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PAYMENT_BY_ID(id));
  },

  getStats: async (): Promise<PaymentStats> => {
    const response = await apiClient.get<ApiResponse<PaymentStats>>(
      ENDPOINTS.PAYMENT_STATS
    );
    return response.data.data;
  },
};