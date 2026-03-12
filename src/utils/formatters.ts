import { format, parseISO, isValid } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { isArabic, localize } from '@/i18n/localize';

export function formatDate(dateStr: string, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, formatStr, { locale: isArabic() ? ar : enUS });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, 'dd/MM/yyyy HH:mm');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(isArabic() ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat(isArabic() ? 'ar-SA' : 'en-US').format(num);
}

export function formatPercentage(value?: number | null): string {
  if (typeof value !== "number") return "0.0%";
  return `${value.toFixed(1)}%`;
}
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    graduated: 'bg-blue-100 text-blue-800',
    withdrawn: 'bg-red-100 text-red-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    terminated: 'bg-red-100 text-red-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    excused: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, { ar: string; en: string }> = {
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    graduated: { ar: 'متخرج', en: 'Graduated' },
    withdrawn: { ar: 'منسحب', en: 'Withdrawn' },
    on_leave: { ar: 'في إجازة', en: 'On Leave' },
    terminated: { ar: 'منتهي', en: 'Terminated' },
    present: { ar: 'حاضر', en: 'Present' },
    absent: { ar: 'غائب', en: 'Absent' },
    late: { ar: 'متأخر', en: 'Late' },
    excused: { ar: 'معذور', en: 'Excused' },
    paid: { ar: 'مدفوع', en: 'Paid' },
    pending: { ar: 'معلق', en: 'Pending' },
    overdue: { ar: 'متأخر', en: 'Overdue' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    failed: { ar: 'فشل', en: 'Failed' },
    male: { ar: 'ذكر', en: 'Male' },
    female: { ar: 'أنثى', en: 'Female' },
    quiz: { ar: 'اختبار قصير', en: 'Quiz' },
    midterm: { ar: 'اختبار نصفي', en: 'Midterm' },
    final: { ar: 'اختبار نهائي', en: 'Final' },
    exam: { ar: 'اختبار', en: 'Exam' },
    homework: { ar: 'واجب', en: 'Homework' },
    assignment: { ar: 'واجب', en: 'Assignment' },
    project: { ar: 'مشروع', en: 'Project' },
    salary: { ar: 'رواتب', en: 'Salary' },
    maintenance: { ar: 'صيانة', en: 'Maintenance' },
    supplies: { ar: 'مستلزمات', en: 'Supplies' },
    utilities: { ar: 'مرافق', en: 'Utilities' },
    other: { ar: 'أخرى', en: 'Other' },
    info: { ar: 'معلومات', en: 'Info' },
    warning: { ar: 'تحذير', en: 'Warning' },
    alert: { ar: 'تنبيه', en: 'Alert' },
    success: { ar: 'نجاح', en: 'Success' },
    admin: { ar: 'مدير', en: 'Admin' },
    teacher: { ar: 'معلم', en: 'Teacher' },
    student: { ar: 'طالب', en: 'Student' },
    parent: { ar: 'ولي أمر', en: 'Parent' },
    reception: { ar: 'استقبال', en: 'Reception' },
    father: { ar: 'أب', en: 'Father' },
    mother: { ar: 'أم', en: 'Mother' },
    guardian: { ar: 'وصي', en: 'Guardian' },
    attendance: { ar: 'حضور', en: 'Attendance' },
    financial: { ar: 'مالي', en: 'Financial' },
    performance: { ar: 'أداء', en: 'Performance' },
    partial: { ar: 'جزئي', en: 'Partial' },
    scheduled: { ar: 'مجدولة', en: 'Scheduled' },
  };
  const label = labels[status];
  if (!label) return status;
  return localize(label.ar, label.en);
}
