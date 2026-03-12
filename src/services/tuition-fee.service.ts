import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/common.types';
import {
  TuitionFee,
  CreateTuitionFeeData,
  UpdateTuitionFeeData,
  StudentBalanceSummary,
} from '@/types/tuition-fee.types';

export interface TuitionFeeListParams {
  academicYear?: string;
}

export const tuitionFeeService = {
  getAll: async (params?: TuitionFeeListParams): Promise<TuitionFee[]> => {
    const response = await apiClient.get<ApiResponse<TuitionFee[]>>(
      ENDPOINTS.TUITION_FEES,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<TuitionFee> => {
    const response = await apiClient.get<ApiResponse<TuitionFee>>(
      ENDPOINTS.TUITION_FEE_BY_ID(id)
    );
    return response.data.data;
  },

  getByGrade: async (
    gradeId: number,
    academicYear?: string
  ): Promise<TuitionFee> => {
    const response = await apiClient.get<ApiResponse<TuitionFee>>(
      ENDPOINTS.TUITION_FEES_BY_GRADE(gradeId),
      { params: academicYear ? { academicYear } : undefined }
    );
    return response.data.data;
  },

  getStudentBalance: async (
    studentId: number,
    academicYear: string
  ): Promise<StudentBalanceSummary> => {
    const response = await apiClient.get<ApiResponse<StudentBalanceSummary>>(
      ENDPOINTS.TUITION_FEE_STUDENT_BALANCE(studentId),
      { params: { academicYear } }
    );
    return response.data.data;
  },

  create: async (data: CreateTuitionFeeData): Promise<TuitionFee> => {
    const response = await apiClient.post<ApiResponse<TuitionFee>>(
      ENDPOINTS.TUITION_FEES,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateTuitionFeeData): Promise<TuitionFee> => {
    const response = await apiClient.patch<ApiResponse<TuitionFee>>(
      ENDPOINTS.TUITION_FEE_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.TUITION_FEE_BY_ID(id));
  },
};