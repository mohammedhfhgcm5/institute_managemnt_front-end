import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/common.types';
import {
  LoginCredentials,
  AuthResponse,
  AuthUser,
  ChangePasswordData,
} from '@/types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data.data;
  },

  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get<ApiResponse<AuthUser>>(
      ENDPOINTS.AUTH.PROFILE
    );
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },
};
