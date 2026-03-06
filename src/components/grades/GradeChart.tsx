import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGradeStats } from '@/hooks/api/useGrades';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useLocale } from '@/hooks/useLocale';
import { formatPercentage } from '@/utils/formatters';

export function GradeChart() {
  const { text } = useLocale();
  const { data: stats, isLoading } = useGradeStats();

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text('إحصائيات الدرجات', 'Grade Statistics')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.averageScore.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">{text('المعدل', 'Average')}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-600">{stats.highestScore}</p>
            <p className="text-sm text-muted-foreground">{text('أعلى درجة', 'Highest Score')}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-2xl font-bold text-red-600">{stats.lowestScore}</p>
            <p className="text-sm text-muted-foreground">{text('أقل درجة', 'Lowest Score')}</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-2xl font-bold text-purple-600">{formatPercentage(stats.passRate)}</p>
            <p className="text-sm text-muted-foreground">{text('نسبة النجاح', 'Pass Rate')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
