import { useStudent } from '@/hooks/api/useStudents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface StudentDetailProps {
  studentId: number;
}

export function StudentDetail({ studentId }: StudentDetailProps) {
  const { data: student, isLoading, isError, refetch } = useStudent(studentId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !student) return <ErrorMessage onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{student.firstName} {student.lastName}</span>
          <Badge className={cn(getStatusColor(student.status))}>
            {getStatusLabel(student.status)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">????? ???????</p>
            <p className="font-medium">{formatDate(student.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">?????</p>
            <p className="font-medium">{getStatusLabel(student.gender)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">????? ????????</p>
            <p className="font-medium">{student.academicYear || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">????? ???????</p>
            <p className="font-medium">{formatDate(student.registrationDate)}</p>
          </div>
          {student.address && (
            <div className="col-span-2">
              <p className="text-muted-foreground">???????</p>
              <p className="font-medium">{student.address}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
