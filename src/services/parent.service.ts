import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import { Parent, CreateParentData, UpdateParentData } from '@/types/parent.types';

export const parentService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Parent>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Parent>>>(
      ENDPOINTS.PARENTS,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Parent> => {
    const response = await apiClient.get<ApiResponse<Parent>>(
      ENDPOINTS.PARENT_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateParentData): Promise<Parent> => {
    const response = await apiClient.post<ApiResponse<Parent>>(
      ENDPOINTS.PARENTS,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateParentData): Promise<Parent> => {
    const response = await apiClient.patch<ApiResponse<Parent>>(
      ENDPOINTS.PARENT_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PARENT_BY_ID(id));
  },
};