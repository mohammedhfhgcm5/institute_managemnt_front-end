import { useDashboardStats } from '@/hooks/api/useDashboard';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Bell,
  Building2,
  ClipboardCheck,
  GraduationCap,
  TrendingDown,
  Users,
  UserCircle,
  Wallet,
  Landmark,
} from 'lucide-react';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from '@/utils/formatters';

export function OverviewCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return null;

  const attendanceRate = stats.todayAttendance.total
    ? (stats.todayAttendance.present / stats.todayAttendance.total) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={formatNumber(stats.overview.students.total)}
        description={`Active: ${formatNumber(stats.overview.students.active)}`}
        icon={GraduationCap}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
      />

      <StatCard
        title="Total Teachers"
        value={formatNumber(stats.overview.teachers.total)}
        description={`Active: ${formatNumber(stats.overview.teachers.active)}`}
        icon={Users}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
      />

      <StatCard
        title="Parents"
        value={formatNumber(stats.overview.parents)}
        icon={UserCircle}
        iconColor="text-indigo-600"
        iconBgColor="bg-indigo-100"
      />

      <StatCard
        title="Sections"
        value={formatNumber(stats.overview.sections)}
        icon={Building2}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
      />

      <StatCard
        title="Today Attendance"
        value={formatPercentage(attendanceRate)}
        description={`${formatNumber(stats.todayAttendance.present)} of ${formatNumber(
          stats.todayAttendance.total
        )} present`}
        icon={ClipboardCheck}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-100"
      />

      <StatCard
        title="Total Paid"
        value={formatCurrency(stats.financial.totalPaid)}
        icon={Wallet}
        iconColor="text-cyan-600"
        iconBgColor="bg-cyan-100"
      />

      <StatCard
        title="Total Expenses"
        value={formatCurrency(stats.financial.totalExpenses)}
        icon={TrendingDown}
        iconColor="text-red-600"
        iconBgColor="bg-red-100"
      />

      <StatCard
        title="Net Balance"
        value={formatCurrency(stats.financial.netBalance)}
        icon={Landmark}
        iconColor="text-orange-600"
        iconBgColor="bg-orange-100"
      />

      <StatCard
        title="Unread Notifications"
        value={formatNumber(stats.notifications.unread)}
        icon={Bell}
        iconColor="text-yellow-600"
        iconBgColor="bg-yellow-100"
      />
    </div>
  );
}
