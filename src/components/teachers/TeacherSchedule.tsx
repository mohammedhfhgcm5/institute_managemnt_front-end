import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/useLocale';

interface TeacherScheduleProps {
  teacherId: number;
}

export function TeacherSchedule({ teacherId }: TeacherScheduleProps) {
  const { text } = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text('جدول المعلم', 'Teacher Schedule')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          {text('سيتم إضافة جدول المعلم قريباً', 'Teacher schedule will be added soon')}
        </p>
      </CardContent>
    </Card>
  );
}
