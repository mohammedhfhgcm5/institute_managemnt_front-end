import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import { Course, CreateCourseData, UpdateCourseData } from '@/types/course.types';

export const courseService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Course>>>(
      ENDPOINTS.SUBJECTS,
      { params }
    );


    console.log(response.data.data.data);
    
    return response.data.data;
  },

  getById: async (id: number): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<Course>>(
      ENDPOINTS.SUBJECT_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateCourseData): Promise<Course> => {
    const response = await apiClient.post<ApiResponse<Course>>(
      ENDPOINTS.SUBJECTS,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateCourseData): Promise<Course> => {
    const response = await apiClient.patch<ApiResponse<Course>>(
      ENDPOINTS.SUBJECT_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.SUBJECT_BY_ID(id));
  },
};
