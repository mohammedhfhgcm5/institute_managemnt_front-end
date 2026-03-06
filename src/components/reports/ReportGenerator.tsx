import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';

export function ReportGenerator() {
  const { text } = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text('مولد التقارير', 'Report Generator')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          {text('استخدم صفحة التقارير لإنشاء تقرير جديد', 'Use the reports page to create a new report')}
        </p>
      </CardContent>
    </Card>
  );
}
