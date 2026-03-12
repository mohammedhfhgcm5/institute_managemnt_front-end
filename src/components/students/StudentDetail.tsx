import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/hooks/useLocale';
import { Student } from '@/types/student.types';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface StudentDetailProps {
  student: Student;
}

export function StudentDetail({ student }: StudentDetailProps) {
  const { text } = useLocale();

  const parentName = student.parent
    ? `${student.parent.firstName} ${student.parent.lastName}`
    : '-';
  const parentRelationship = student.parent?.relationship
    ? getStatusLabel(student.parent.relationship)
    : '-';

  const gradeName =
    student.section?.grade?.name ||
    (student.section?.gradeId ? `#${student.section.gradeId}` : '-');
  const sectionName = student.section?.name || '-';
  const sectionYear = student.section?.academicYear || '-';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span>{student.firstName} {student.lastName}</span>
          <Badge className={cn(getStatusColor(student.status))}>
            {getStatusLabel(student.status)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">
            {text('بيانات الطالب', 'Student Information')}
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <InfoItem label={text('رقم الطالب', 'Student ID')} value={student.id} />
            <InfoItem label={text('الجنس', 'Gender')} value={getStatusLabel(student.gender)} />
            <InfoItem label={text('تاريخ الميلاد', 'Date of Birth')} value={formatDate(student.dateOfBirth)} />
            <InfoItem label={text('السنة الدراسية', 'Academic Year')} value={student.academicYear || '-'} />
            <InfoItem label={text('تاريخ التسجيل', 'Registration Date')} value={formatDate(student.registrationDate)} />
            <InfoItem label={text('البريد الإلكتروني', 'Email')} value={student.user?.email || '-'} />
          </div>
          {student.address && (
            <div>
              <p className="text-muted-foreground text-sm">{text('العنوان', 'Address')}</p>
              <p className="font-medium">{student.address}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">
            {text('المعلومات الأكاديمية', 'Academic Information')}
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <InfoItem label={text('الصف', 'Grade')} value={gradeName} />
            <InfoItem label={text('الشعبة', 'Section')} value={sectionName} />
            <InfoItem label={text('سنة الشعبة', 'Section Year')} value={sectionYear} />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">
            {text('بيانات ولي الأمر', 'Parent Information')}
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <InfoItem label={text('ولي الأمر', 'Parent')} value={parentName} />
            <InfoItem label={text('العلاقة', 'Relationship')} value={parentRelationship} />
            <InfoItem label={text('الهاتف', 'Phone')} value={student.parent?.phone || '-'} />
            <InfoItem label={text('البريد الإلكتروني', 'Email')} value={student.parent?.email || '-'} />
          </div>
          {student.parent?.address && (
            <div>
              <p className="text-muted-foreground text-sm">{text('عنوان ولي الأمر', 'Parent Address')}</p>
              <p className="font-medium">{student.parent.address}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-medium">{value ?? '-'}</p>
    </div>
  );
}