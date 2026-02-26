import { format, parseISO, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';

export function formatDate(dateStr: string, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, formatStr, { locale: ar });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, 'dd/MM/yyyy HH:mm');
}

export function formatCurrency(amount: number): string {

  console.log("amount :", amount);
  
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-SA').format(num);
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
  const labels: Record<string, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    graduated: 'تخرج',
    withdrawn: 'منسحب',
    on_leave: 'في إجازة',
    terminated: 'منتهي',
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    excused: 'معذور',
    paid: 'مدفوع',
    pending: 'معلق',
    overdue: 'متأخر',
    cancelled: 'ملغي',
    completed: 'مكتمل',
    failed: 'فشل',
    male: 'ذكر',
    female: 'أنثى',
    quiz: 'اختبار قصير',
    midterm: 'اختبار نصفي',
    final: 'اختبار نهائي',
    assignment: 'واجب',
    project: 'مشروع',
    salary: 'رواتب',
    maintenance: 'صيانة',
    supplies: 'مستلزمات',
    utilities: 'مرافق',
    other: 'أخرى',
    info: 'معلومات',
    warning: 'تحذير',
    alert: 'تنبيه',
    success: 'نجاح',
    admin: 'مدير',
    teacher: 'معلم',
    student: 'طالب',
    parent: 'ولي أمر',
    reception: 'استقبال',
    attendance: 'حضور',
    financial: 'مالي',
    performance: 'أداء',
  };
  return labels[status] || status;
}
