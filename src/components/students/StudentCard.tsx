import { Student } from '@/types/student.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getStatusColor, getStatusLabel } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  onClick?: () => void;
}

export function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary">
            {student.firstName[0]}
            {student.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">
            {student.firstName} {student.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{student.academicYear || '-'}</p>
        </div>
        <Badge className={cn('text-xs', getStatusColor(student.status))}>
          {getStatusLabel(student.status)}
        </Badge>
      </CardContent>
    </Card>
  );
}
