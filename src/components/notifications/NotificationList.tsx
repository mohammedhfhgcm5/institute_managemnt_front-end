import { useState } from "react";
import {
  useMyNotifications,
  useMarkAsRead,
  useMarkAllRead,
} from "@/hooks/api/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import {
  formatDateTime,
  getStatusLabel,
  getStatusColor,
} from "@/utils/formatters";
import { CheckCheck, Mail, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useMyNotifications({
    page,
    limit: 20,
  });
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllRead();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage onRetry={() => refetch()} />;

  const notifications = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">إشعاراتي</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
        >
          <CheckCheck className="ml-2 h-4 w-4" />
          تعليم الكل كمقروء
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد إشعارات
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-accent/30",
                !notification.isRead && "border-primary/30 bg-primary/5",
              )}
              onClick={() => {
                if (!notification.isRead) {
                  markAsRead.mutate(notification.id);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {notification.isRead ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Mail className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{notification.title}</span>
                      <Badge
                        className={cn(
                          "text-[10px]",
                          getStatusColor(notification.type),
                        )}
                      >
                        {getStatusLabel(notification.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            السابق
          </Button>
          <span className="flex items-center px-3 text-sm">
            {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
