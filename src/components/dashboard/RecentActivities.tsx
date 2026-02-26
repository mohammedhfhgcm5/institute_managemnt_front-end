import { useRecentActivities } from '@/hooks/api/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDateTime } from '@/utils/formatters';
import { Activity } from 'lucide-react';

export function RecentActivities() {
  const { data: activities, isLoading } = useRecentActivities();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>النشاطات الأخيرة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(!activities || activities.length === 0) ? (
            <p className="text-center text-muted-foreground py-4">
              لا توجد نشاطات حديثة
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
