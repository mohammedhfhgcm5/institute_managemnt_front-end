import { useCourse } from '@/hooks/api/useCourses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatDate } from '@/utils/formatters';

interface CourseDetailProps {
  courseId: number;
}

export function CourseDetail({ courseId }: CourseDetailProps) {
  const { data: course, isLoading, isError, refetch } = useCourse(courseId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !course) return <ErrorMessage onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">تاريخ الإنشاء</p><p className="font-medium">{formatDate(course.createdAt)}</p></div>
          <div><p className="text-muted-foreground">آخر تحديث</p><p className="font-medium">{formatDate(course.updatedAt)}</p></div>
          {course.description && <div className="col-span-2"><p className="text-muted-foreground">الوصف</p><p className="font-medium">{course.description}</p></div>}
        </div>
      </CardContent>
    </Card>
  );
}
