import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGradeStats } from '@/hooks/api/useGrades';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatPercentage } from '@/utils/formatters';

export function GradeChart() {
  const { data: stats, isLoading } = useGradeStats();

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>إحصائيات الدرجات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.averageScore.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">المعدل</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-600">{stats.highestScore}</p>
            <p className="text-sm text-muted-foreground">أعلى درجة</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-2xl font-bold text-red-600">{stats.lowestScore}</p>
            <p className="text-sm text-muted-foreground">أقل درجة</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-2xl font-bold text-purple-600">{formatPercentage(stats.passRate)}</p>
            <p className="text-sm text-muted-foreground">نسبة النجاح</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
