import { useDashboardStats } from '@/hooks/api/useDashboard';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  TrendingUp,
  TrendingDown,
  UserCircle,
} from 'lucide-react';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters';

export function OverviewCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="إجمالي الطلاب"
        value={formatNumber(stats.totalStudents)}
        icon={GraduationCap}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
      />
      <StatCard
        title="إجمالي المعلمين"
        value={formatNumber(stats.totalTeachers)}
        icon={Users}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />
      <StatCard
        title="المواد الدراسية"
        value={formatNumber(stats.totalCourses)}
        icon={BookOpen}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
      />
      <StatCard
        title="نسبة الحضور اليوم"
        value={formatPercentage(stats.attendanceRate)}
        icon={ClipboardCheck}
        iconColor="text-orange-600"
        iconBgColor="bg-orange-100"
      />
      <StatCard
        title="المدفوعات المعلقة"
        value={formatNumber(stats.pendingPayments)}
        icon={CreditCard}
        iconColor="text-yellow-600"
        iconBgColor="bg-yellow-100"
      />
      <StatCard
        title="أولياء الأمور"
        value={formatNumber(stats.totalParents)}
        icon={UserCircle}
        iconColor="text-indigo-600"
        iconBgColor="bg-indigo-100"
      />
      <StatCard
        title="إجمالي الإيرادات"
        value={formatCurrency(stats.totalRevenue)}
        icon={TrendingUp}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-100"
      />
      <StatCard
        title="إجمالي المصروفات"
        value={formatCurrency(stats.totalExpenses)}
        icon={TrendingDown}
        iconColor="text-red-600"
        iconBgColor="bg-red-100"
      />
    </div>
  );
}