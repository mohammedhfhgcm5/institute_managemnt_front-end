import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import { Teacher, CreateTeacherData, UpdateTeacherData } from '@/types/teacher.types';

export const teacherService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Teacher>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Teacher>>>(
      ENDPOINTS.TEACHERS,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Teacher> => {
    const response = await apiClient.get<ApiResponse<Teacher>>(
      ENDPOINTS.TEACHER_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateTeacherData): Promise<Teacher> => {
    const response = await apiClient.post<ApiResponse<Teacher>>(
      ENDPOINTS.TEACHERS,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateTeacherData): Promise<Teacher> => {
    const response = await apiClient.patch<ApiResponse<Teacher>>(
      ENDPOINTS.TEACHER_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.TEACHER_BY_ID(id));
  },
};