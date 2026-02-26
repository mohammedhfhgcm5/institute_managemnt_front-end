import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import {
  Notification,
  CreateNotificationData,
  BulkNotificationData,
  UnreadCountResponse,
} from '@/types/notification.types';

export const notificationService = {
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Notification>>
    >(ENDPOINTS.NOTIFICATIONS, { params });
    return response.data.data;
  },

  getMy: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Notification>>
    >(ENDPOINTS.MY_NOTIFICATIONS, { params });
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<UnreadCountResponse>>(
      ENDPOINTS.UNREAD_COUNT
    );
    return response.data.data.count;
  },

  create: async (data: CreateNotificationData): Promise<Notification> => {
    const response = await apiClient.post<ApiResponse<Notification>>(
      ENDPOINTS.NOTIFICATIONS,
      data
    );
    return response.data.data;
  },

  sendBulk: async (data: BulkNotificationData): Promise<void> => {
    await apiClient.post(ENDPOINTS.BULK_NOTIFICATION, data);
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.patch(ENDPOINTS.MARK_AS_READ(id));
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch(ENDPOINTS.MARK_ALL_READ);
  },
};