import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUnreadCount, useMyNotifications, useMarkAsRead } from '@/hooks/api/useNotifications';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, getStatusLabel } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notificationsData } = useMyNotifications({ limit: 5 });
  const markAsRead = useMarkAsRead();
  const navigate = useNavigate();

  const notifications = notificationsData?.data || [];

  const handleNotificationClick = (id: number, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>الإشعارات</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} جديد
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            لا توجد إشعارات
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                !notification.isRead ? 'bg-accent/50' : ''
              }`}
              onClick={() =>
                handleNotificationClick(notification.id, notification.isRead)
              }
            >
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium text-sm">{notification.title}</span>
                <Badge variant="outline" className="text-[10px] mr-auto">
                  {getStatusLabel(notification.type)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatDateTime(notification.createdAt)}
              </p>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-center text-primary cursor-pointer justify-center"
          onClick={() => navigate('/notifications')}
        >
          عرض جميع الإشعارات
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
