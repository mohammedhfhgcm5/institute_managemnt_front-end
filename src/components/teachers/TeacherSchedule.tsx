import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeacherScheduleProps {
  teacherId: number;
}

export function TeacherSchedule({ teacherId }: TeacherScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>جدول المعلم</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          سيتم إضافة جدول المعلم قريباً
        </p>
      </CardContent>
    </Card>
  );
}
