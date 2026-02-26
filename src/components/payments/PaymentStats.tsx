import { usePaymentStats } from '@/hooks/api/usePayments';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/formatters';
import { CheckCircle, Clock, CircleDollarSign } from 'lucide-react';

export function PaymentStats() {
  const { data: stats, isLoading } = usePaymentStats();

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard title="Paid" value={formatCurrency(stats.totalPaid)} icon={CheckCircle} iconColor="text-green-600" iconBgColor="bg-green-100" />
      <StatCard title="Pending" value={formatCurrency(stats.totalPending)} icon={Clock} iconColor="text-yellow-600" iconBgColor="bg-yellow-100" />
      <StatCard title="Partial" value={formatCurrency(stats.totalPartial)} icon={CircleDollarSign} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
    </div>
  );
}
