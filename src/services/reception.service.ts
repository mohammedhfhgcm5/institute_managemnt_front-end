import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import { Reception, CreateReceptionData, UpdateReceptionData } from '@/types/reception.types';

export const receptionService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Reception>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Reception>>>(
      ENDPOINTS.RECEPTION,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Reception> => {
    const response = await apiClient.get<ApiResponse<Reception>>(
      ENDPOINTS.RECEPTION_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateReceptionData): Promise<Reception> => {
    const response = await apiClient.post<ApiResponse<Reception>>(
      ENDPOINTS.RECEPTION,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateReceptionData): Promise<Reception> => {
    const response = await apiClient.patch<ApiResponse<Reception>>(
      ENDPOINTS.RECEPTION_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.RECEPTION_BY_ID(id));
  },
};
