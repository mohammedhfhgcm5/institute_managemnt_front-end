import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';

export function AttendanceCalendar() {
  const { text } = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text('تقويم الحضور', 'Attendance Calendar')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          {text('سيتم إضافة تقويم الحضور قريباً', 'Attendance calendar will be added soon')}
        </p>
      </CardContent>
    </Card>
  );
}
