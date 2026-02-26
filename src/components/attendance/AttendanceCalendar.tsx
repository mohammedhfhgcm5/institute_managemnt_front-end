import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AttendanceCalendar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تقويم الحضور</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          سيتم إضافة تقويم الحضور قريباً
        </p>
      </CardContent>
    </Card>
  );
}
