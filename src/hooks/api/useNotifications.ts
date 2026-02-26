import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { PaginationParams } from '@/types/common.types';
import {
  CreateNotificationData,
  BulkNotificationData,
} from '@/types/notification.types';
import { toast } from 'sonner';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: PaginationParams) =>
    [...notificationKeys.lists(), params] as const,
  my: (params?: PaginationParams) =>
    [...notificationKeys.all, 'my', params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export const useNotifications = (params?: PaginationParams) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.getAll(params),
  });
};

export const useMyNotifications = (params?: PaginationParams) => {
  return useQuery({
    queryKey: notificationKeys.my(params),
    queryFn: () => notificationService.getMy(params),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNotificationData) =>
      notificationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success('تم إرسال الإشعار بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useSendBulkNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkNotificationData) =>
      notificationService.sendBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success('تم إرسال الإشعارات بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('تم تعليم جميع الإشعارات كمقروءة');
    },
  });
};