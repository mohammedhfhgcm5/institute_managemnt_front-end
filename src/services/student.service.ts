import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import { Student, CreateStudentData, UpdateStudentData } from '@/types/student.types';

export const studentService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Student>>>(
      ENDPOINTS.STUDENTS,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Student> => {
    const response = await apiClient.get<ApiResponse<Student>>(
      ENDPOINTS.STUDENT_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateStudentData): Promise<Student> => {
    const response = await apiClient.post<ApiResponse<Student>>(
      ENDPOINTS.STUDENTS,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateStudentData): Promise<Student> => {
    const response = await apiClient.patch<ApiResponse<Student>>(
      ENDPOINTS.STUDENT_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.STUDENT_BY_ID(id));
  },
};
