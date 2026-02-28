import { useState } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationForm } from "@/components/notifications/NotificationForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Plus } from "lucide-react";

export default function NotificationsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { user } = useAuth();
  const permissions = usePermissions();
  const canCreateNotifications =
    permissions.canManageNotifications && user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الإشعارات</h1>
        {canCreateNotifications && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إرسال إشعار
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
