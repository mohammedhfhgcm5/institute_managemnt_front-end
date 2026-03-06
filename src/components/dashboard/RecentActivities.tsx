import { useDashboardStats } from '@/hooks/api/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/hooks/useLocale';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

const formatStudentName = (firstName: string, lastName: string): string => {
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Unknown Student';
};

export function RecentActivities() {
  const { text } = useLocale();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text('أحدث المدفوعات', 'Recent Payments')}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {stats.recentPayments.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              {text('لا توجد مدفوعات حديثة.', 'No recent payments found.')}
            </p>
          ) : (
            stats.recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-start justify-between gap-3 rounded-md border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {formatStudentName(
                      payment.student.firstName,
                      payment.student.lastName
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(payment.paymentDate ?? payment.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {text('رقم الإيصال', 'Receipt')}: {payment.receiptNumber || '-'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(payment.finalAmount)}
                  </p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
