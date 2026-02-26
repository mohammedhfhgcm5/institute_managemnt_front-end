import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import { UserProfile, CreateUserData, UpdateUserData } from '@/types/user.types';

export const userService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<UserProfile>>>(
      ENDPOINTS.USERS.USERS,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(
      ENDPOINTS.USERS.USER_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateUserData): Promise<UserProfile> => {
    const response = await apiClient.post<ApiResponse<UserProfile>>(
      ENDPOINTS.USERS.USERS,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateUserData): Promise<UserProfile> => {
    const response = await apiClient.patch<ApiResponse<UserProfile>>(
      ENDPOINTS.USERS.USER_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.USERS.USER_BY_ID(id));
  },
};
