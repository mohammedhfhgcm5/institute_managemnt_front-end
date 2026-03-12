import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import {
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  PaymentStats,
  PaymentsByStudentResponse,
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

  getByStudent: async (
    studentId: number,
    academicYear?: string
  ): Promise<PaymentsByStudentResponse> => {
    const response = await apiClient.get<ApiResponse<Payment[] | PaymentsByStudentResponse>>(
      ENDPOINTS.PAYMENTS_BY_STUDENT(studentId),
      { params: academicYear ? { academicYear } : undefined }
    );
    const data = response.data.data;
    if (Array.isArray(data)) {
      return { payments: data };
    }
    if (!data || !Array.isArray((data as PaymentsByStudentResponse).payments)) {
      return { payments: [] };
    }
    return data as PaymentsByStudentResponse;
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

  getStats: async (academicYear?: string): Promise<PaymentStats> => {
    const response = await apiClient.get<ApiResponse<PaymentStats>>(
      ENDPOINTS.PAYMENT_STATS,
      { params: academicYear ? { academicYear } : undefined }
    );
    return response.data.data;
  },
};
