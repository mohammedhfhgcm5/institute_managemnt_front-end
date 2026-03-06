import { useState } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationForm } from "@/components/notifications/NotificationForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocale } from "@/hooks/useLocale";
import { Plus } from "lucide-react";

export default function NotificationsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { user } = useAuth();
  const { text } = useLocale();
  const permissions = usePermissions();
  const canCreateNotifications =
    permissions.canManageNotifications && user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{text("الإشعارات", "Notifications")}</h1>
        {canCreateNotifications && (
          <Button onClick={() => setFormOpen(true)} className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            {text("إرسال إشعار", "Send Notification")}
          </Button>
        )}
      </div>
      <NotificationList />
      {canCreateNotifications && (
        <NotificationForm open={formOpen} onOpenChange={setFormOpen} />
      )}
    </div>
  );
}
