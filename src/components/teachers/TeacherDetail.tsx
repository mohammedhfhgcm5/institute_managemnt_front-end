import { useTeacher } from '@/hooks/api/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/utils/formatters';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

interface TeacherDetailProps {
  teacherId: number;
}

export function TeacherDetail({ teacherId }: TeacherDetailProps) {
  const { text } = useLocale();
  const { data: teacher, isLoading, isError, refetch } = useTeacher(teacherId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !teacher) return <ErrorMessage onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span>
            {teacher.firstName} {teacher.lastName}
          </span>
          <Badge className={cn(getStatusColor(teacher.status))}>{getStatusLabel(teacher.status)}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">{text('التخصص', 'Specialization')}</p>
            <p className="font-medium">{teacher.specialization}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{text('المؤهلات', 'Qualifications')}</p>
            <p className="font-medium">{teacher.qualifications || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{text('سنوات الخبرة', 'Experience Years')}</p>
            <p className="font-medium">{teacher.experienceYears ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{text('الراتب', 'Salary')}</p>
            <p className="font-medium">
              {typeof teacher.salary === 'number' ? formatCurrency(teacher.salary) : '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{text('تاريخ التوظيف', 'Hire Date')}</p>
            <p className="font-medium">{teacher.hireDate ? formatDate(teacher.hireDate) : '-'}</p>
          </div>
          {teacher.bio && (
            <div className="col-span-2">
              <p className="text-muted-foreground">{text('السيرة الذاتية', 'Bio')}</p>
              <p className="font-medium">{teacher.bio}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
