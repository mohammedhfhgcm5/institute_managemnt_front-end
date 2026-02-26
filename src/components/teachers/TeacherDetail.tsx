import { useTeacher } from '@/hooks/api/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface TeacherDetailProps {
  teacherId: number;
}

export function TeacherDetail({ teacherId }: TeacherDetailProps) {
  const { data: teacher, isLoading, isError, refetch } = useTeacher(teacherId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !teacher) return <ErrorMessage onRetry={() => refetch()} />;

  console.log(teacher.salary);
  

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {teacher.firstName} {teacher.lastName}
          </span>
          <Badge className={cn(getStatusColor(teacher.status))}>{getStatusLabel(teacher.status)}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">التخصص</p>
            <p className="font-medium">{teacher.specialization}</p>
          </div>
          <div>
            <p className="text-muted-foreground">المؤهلات</p>
            <p className="font-medium">{teacher.qualifications || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">سنوات الخبرة</p>
            <p className="font-medium">{teacher.experienceYears ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">الراتب</p>
            <p className="font-medium">
              { teacher.salary ?? '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">تاريخ التوظيف</p>
            <p className="font-medium">{teacher.hireDate ? formatDate(teacher.hireDate) : '-'}</p>
          </div>
          {teacher.bio && (
            <div className="col-span-2">
              <p className="text-muted-foreground">السيرة الذاتية</p>
              <p className="font-medium">{teacher.bio}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}