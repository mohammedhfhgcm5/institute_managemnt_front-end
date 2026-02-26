import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import {
  Assessment,
  CreateAssessmentData,
  UpdateAssessmentData,
} from '@/types/assessment.types';

export const assessmentService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Assessment>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Assessment>>>(
      ENDPOINTS.ASSESSMENTS,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Assessment> => {
    const response = await apiClient.get<ApiResponse<Assessment>>(
      ENDPOINTS.ASSESSMENT_BY_ID(id)
    );
    return response.data.data;
  },

  getByStudent: async (studentId: number): Promise<Assessment[]> => {
    const response = await apiClient.get<ApiResponse<Assessment[]>>(
      ENDPOINTS.ASSESSMENTS_BY_STUDENT(studentId)
    );
    return response.data.data;
  },

  create: async (data: CreateAssessmentData): Promise<Assessment> => {
    const response = await apiClient.post<ApiResponse<Assessment>>(
      ENDPOINTS.ASSESSMENTS,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateAssessmentData): Promise<Assessment> => {
    const response = await apiClient.patch<ApiResponse<Assessment>>(
      ENDPOINTS.ASSESSMENT_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.ASSESSMENT_BY_ID(id));
  },
};
