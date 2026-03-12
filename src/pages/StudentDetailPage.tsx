import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { useStudent } from '@/hooks/api/useStudents';
import { useTuitionFees, useStudentTuitionBalance } from '@/hooks/api/useTuitionFees';
import { usePaymentsByStudent } from '@/hooks/api/usePayments';
import { StudentDetail } from '@/components/students/StudentDetail';
import { DataTable, Column } from '@/components/common/DataTable';
import { Payment } from '@/types/payment.types';
import { Attendance } from '@/types/attendance.types';
import { Assessment } from '@/types/assessment.types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/common/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Wallet, CheckCircle, CircleDollarSign } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export default function StudentDetailPage() {
  const { text } = useLocale();
  const navigate = useNavigate();
  const { id } = useParams();
  const studentId = Number(id);

  const {
    data: student,
    isLoading: studentLoading,
    isError: studentError,
    refetch: refetchStudent,
  } = useStudent(studentId);

  const { data: tuitionFees } = useTuitionFees();
console.log("student  -----> : " ,student);

  const gradeId =
    student?.section?.gradeId ??
    student?.section?.grade?.id ??
    0;

  const academicYearOptions = useMemo(() => {
    if (!gradeId) return [];
    return Array.from(
      new Set(
        (tuitionFees || [])
          .filter((fee) => fee.gradeId === gradeId)
          .map((fee) => fee.academicYear)
      )
    )
      .filter((year) => year)
      .sort()
      .reverse();
  }, [tuitionFees, gradeId]);

  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    if (academicYearOptions.length === 0) return;
    if (academicYear && academicYearOptions.includes(academicYear)) return;

    const preferred =
      student?.academicYear && academicYearOptions.includes(student.academicYear)
        ? student.academicYear
        : academicYearOptions[0];

    if (preferred) setAcademicYear(preferred);
  }, [academicYear, academicYearOptions, student?.academicYear]);

  const { data: balance, isLoading: balanceLoading } = useStudentTuitionBalance(
    studentId,
    academicYear
  );

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    isError: paymentsError,
    refetch: refetchPayments,
  } = usePaymentsByStudent(studentId, academicYear || undefined);

  const payments = useMemo(() => {
    const raw = Array.isArray(paymentsData)
      ? paymentsData
      : paymentsData?.payments || [];

    const toNumber = (value: unknown): number => {
      if (typeof value === 'number') return value;
      if (typeof value !== 'string') return 0;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return raw.map((payment) => ({
      ...payment,
      amount: toNumber(payment.amount),
      discount: toNumber(payment.discount ?? 0),
      finalAmount:
        payment.finalAmount !== undefined && payment.finalAmount !== null
          ? toNumber(payment.finalAmount)
          : undefined,
    }));
  }, [paymentsData]);

  const attendances = student?.attendances || [];
  const assessments = student?.assessments || [];

  const attendanceColumns: Column<Attendance>[] = [
    { key: 'id', header: '#' },
    {
      key: 'date',
      header: text('التاريخ', 'Date'),
      render: (a) => formatDate(a.date),
    },
    {
      key: 'status',
      header: text('الحالة', 'Status'),
      render: (a) => (
        <Badge className={`text-xs ${getStatusColor(a.status)}`}>
          {getStatusLabel(a.status)}
        </Badge>
      ),
    },
    {
      key: 'subject',
      header: text('المادة', 'Subject'),
      render: (a) =>
        a.schedule?.gradeSubject?.subject?.name ||
        a.schedule?.section?.name ||
        '-',
    },
    {
      key: 'notes',
      header: text('ملاحظات', 'Notes'),
      render: (a) => a.notes || '-',
    },
  ];

  const assessmentColumns: Column<Assessment>[] = [
    { key: 'id', header: '#' },
    {
      key: 'title',
      header: text('العنوان', 'Title'),
      render: (a) => a.title || '-',
    },
    {
      key: 'subject',
      header: text('المادة', 'Subject'),
      render: (a) => a.gradeSubject?.subject?.name || '-',
    },
    {
      key: 'type',
      header: text('النوع', 'Type'),
      render: (a) => getStatusLabel(a.type),
    },
    {
      key: 'score',
      header: text('الدرجة', 'Score'),
      render: (a) =>
        a.score !== undefined && a.score !== null
          ? `${a.score}/${a.maxScore}`
          : `-/${a.maxScore}`,
    },
    {
      key: 'assessmentDate',
      header: text('تاريخ التقييم', 'Assessment Date'),
      render: (a) => formatDate(a.assessmentDate),
    },
  ];

  const paymentColumns: Column<Payment>[] = [
    { key: 'id', header: '#' },
    {
      key: 'amount',
      header: text('المبلغ', 'Amount'),
      render: (p) => formatCurrency(p.amount),
    },
    {
      key: 'discount',
      header: text('الخصم', 'Discount'),
      render: (p) => formatCurrency(p.discount || 0),
    },
    {
      key: 'status',
      header: text('الحالة', 'Status'),
      render: (p) => (
        <Badge className={`text-xs ${getStatusColor(p.status)}`}>
          {getStatusLabel(p.status)}
        </Badge>
      ),
    },
    {
      key: 'dueDate',
      header: text('تاريخ الاستحقاق', 'Due Date'),
      render: (p) => formatDate(p.dueDate),
    },
    {
      key: 'paymentDate',
      header: text('تاريخ الدفع', 'Payment Date'),
      render: (p) => (p.paymentDate ? formatDate(p.paymentDate) : '-'),
    },
  ];

  if (studentLoading) return <LoadingSpinner />;
  if (studentError || !student) return <ErrorMessage onRetry={() => refetchStudent()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {text('رجوع', 'Back')}
        </Button>
        <h1 className="text-2xl font-bold">
          {text('تفاصيل الطالب', 'Student Details')}
        </h1>
      </div>

      <StudentDetail student={student} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-2">
          <LabelBlock label={text('السنة الدراسية', 'Academic Year')}>
            <Select
              value={academicYear || undefined}
              onValueChange={setAcademicYear}
              disabled={academicYearOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    academicYearOptions.length === 0
                      ? text('لا توجد سنوات للأقساط', 'No tuition years')
                      : text('اختر السنة الدراسية', 'Select academic year')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.length === 0 ? (
                  <SelectItem value="none" disabled>
                    {text('لا توجد سنوات للأقساط', 'No tuition years')}
                  </SelectItem>
                ) : (
                  academicYearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </LabelBlock>
        </div>
      </div>

      {academicYear ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title={text('القسط السنوي', 'AnnualTuition')}
            value={balanceLoading ? '-' : formatCurrency(balance?.annualAmount || 0)}
            icon={Wallet}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title={text('المدفوع', 'Paid')}
            value={balanceLoading ? '-' : formatCurrency(balance?.totalPaid || 0)}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title={text('المتبقي', 'Remaining')}
            value={balanceLoading ? '-' : formatCurrency(balance?.remaining || 0)}
            icon={CircleDollarSign}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {text('اختر سنة دراسية لعرض الرصيد', 'Select an academic year to view balance')}
        </p>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {text('آخر الحضور', 'RecentAttendance')}
        </h2>
        <DataTable
          columns={attendanceColumns}
          data={attendances}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {text('آخر التقييمات', 'RecentAssessments')}
        </h2>
        <DataTable
          columns={assessmentColumns}
          data={assessments}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {text('دفعات الطالب', 'StudentPayments')}
        </h2>
        <DataTable
          columns={paymentColumns}
          data={student.payments|| []}
          isLoading={paymentsLoading}
          isError={paymentsError}
          onRetry={() => refetchPayments()}
        />
      </div>
    </div>
  );
}

function LabelBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}