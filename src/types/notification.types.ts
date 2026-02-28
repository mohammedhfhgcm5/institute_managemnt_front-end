import {
  NotificationChannel,
  NotificationRelatedType,
  NotificationType,
  UserRole,
} from "./common.types";

export interface Notification {
  id: number;
  userId: number;
  relatedId?: number;
  relatedType?: NotificationRelatedType;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  isRead: boolean;
  readAt?: string;
  sent: boolean;
  sentAt?: string;
  createdAt: string;
}

export interface CreateNotificationData {
  userId: number;
  relatedId?: number;
  relatedType?: NotificationRelatedType;
  title: string;
  message: string;
  type?: NotificationType;
  channel?: NotificationChannel;
}

export interface BulkNotificationData {
  role: UserRole;
  title: string;
  message: string;
}

export interface UnreadCountResponse {
  count?: number;
  unreadCount?: number;
}
