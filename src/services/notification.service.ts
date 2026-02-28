import { apiClient } from "@/api/config";
import { ENDPOINTS } from "@/api/endpoints";
import {
  ApiResponse,
  PaginatedMeta,
  PaginatedResponse,
  PaginationParams,
} from "@/types/common.types";
import {
  Notification,
  CreateNotificationData,
  BulkNotificationData,
  UnreadCountResponse,
} from "@/types/notification.types";

const buildDefaultMeta = (itemsCount: number): PaginatedMeta => ({
  total: itemsCount,
  page: 1,
  limit: Math.max(itemsCount, 1),
  totalPages: 1,
});

const normalizeNotificationsResponse = (
  responseData: PaginatedResponse<Notification> | Notification[],
): PaginatedResponse<Notification> => {
  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      meta: buildDefaultMeta(responseData.length),
    };
  }

  const items = Array.isArray(responseData.data) ? responseData.data : [];
  const meta = responseData.meta;

  return {
    data: items,
    meta: {
      total: typeof meta?.total === "number" ? meta.total : items.length,
      page: typeof meta?.page === "number" ? meta.page : 1,
      limit:
        typeof meta?.limit === "number"
          ? meta.limit
          : Math.max(items.length, 1),
      totalPages:
        typeof meta?.totalPages === "number" ? Math.max(meta.totalPages, 1) : 1,
    },
  };
};

export const notificationService = {
  getAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Notification> | Notification[]>
    >(ENDPOINTS.NOTIFICATIONS, { params });
    return normalizeNotificationsResponse(response.data.data);
  },

  getMy: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Notification> | Notification[]>
    >(ENDPOINTS.MY_NOTIFICATIONS, { params });
    return normalizeNotificationsResponse(response.data.data);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<UnreadCountResponse>>(
      ENDPOINTS.UNREAD_COUNT,
    );
    const unreadCount = response.data.data;
    return unreadCount.count ?? unreadCount.unreadCount ?? 0;
  },

  create: async (data: CreateNotificationData): Promise<Notification> => {
    const response = await apiClient.post<ApiResponse<Notification>>(
      ENDPOINTS.NOTIFICATIONS,
      data,
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
