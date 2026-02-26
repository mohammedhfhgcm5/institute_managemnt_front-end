import { useExpenseStats } from '@/hooks/api/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency, getStatusLabel } from '@/utils/formatters';

export function ExpenseStats() {
  const { data: stats, isLoading } = useExpenseStats();

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>إحصائيات المصروفات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalExpenses)}</p>
        </div>
        <div className="space-y-3">
          {Object.entries(stats.byCategory).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm">{getStatusLabel(category)}</span>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
