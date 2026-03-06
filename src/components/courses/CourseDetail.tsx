import { useCourse } from '@/hooks/api/useCourses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useLocale } from '@/hooks/useLocale';
import { formatDate } from '@/utils/formatters';

interface CourseDetailProps {
  courseId: number;
}

export function CourseDetail({ courseId }: CourseDetailProps) {
  const { text } = useLocale();
  const { data: course, isLoading, isError, refetch } = useCourse(courseId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !course) return <ErrorMessage onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div><p className="text-muted-foreground">{text('تاريخ الإنشاء', 'Created At')}</p><p className="font-medium">{formatDate(course.createdAt)}</p></div>
          <div><p className="text-muted-foreground">{text('آخر تحديث', 'Updated At')}</p><p className="font-medium">{formatDate(course.updatedAt)}</p></div>
          {course.description && <div className="col-span-2"><p className="text-muted-foreground">{text('الوصف', 'Description')}</p><p className="font-medium">{course.description}</p></div>}
        </div>
      </CardContent>
    </Card>
  );
}
