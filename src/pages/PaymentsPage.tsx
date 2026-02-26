import { useState } from 'react';
import { usePayments, useDeletePayment, usePaymentStats } from '@/hooks/api/usePayments';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatCard } from '@/components/common/StatCard';
import { Payment } from '@/types/payment.types';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Edit, Trash2, CheckCircle, Clock, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentForm } from '@/components/payments/PaymentForm';

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = usePayments({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const { data: stats } = usePaymentStats();
  const deletePayment = useDeletePayment();

  const columns: Column<Payment>[] = [
    { key: 'id', header: '#' },
    { key: 'studentId', header: 'Student ID' },
    { key: 'academicYear', header: 'Academic Year' },
    {
      key: 'amount',
      header: 'Amount',
      render: (p) => formatCurrency(p.amount),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (p) => formatCurrency(p.discount),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (p) => formatDate(p.dueDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge className={cn('text-xs', getStatusColor(p.status))}>
          {getStatusLabel(p.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditingPayment(p); setFormOpen(true); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(p.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Paid"
            value={formatCurrency(stats.totalPaid)}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Pending"
            value={formatCurrency(stats.totalPending)}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
          <StatCard
            title="Partial"
            value={formatCurrency(stats.totalPartial)}
            icon={CircleDollarSign}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.meta?.total || 0}
        page={data?.meta?.page || page}
        limit={data?.meta?.limit || 10}
        totalPages={data?.meta?.totalPages || 1}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        actions={
          <Button onClick={() => { setEditingPayment(null); setFormOpen(true); }}>
            <Plus className="ml-2 h-4 w-4" />
            Add Payment
          </Button>
        }
      />

      <PaymentForm open={formOpen} onOpenChange={setFormOpen} payment={editingPayment} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Payment"
        description="Are you sure you want to delete this payment?"
        onConfirm={() => {
          if (deletingId) deletePayment.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
        }}
        isLoading={deletePayment.isPending}
        confirmText="Delete"
      />
    </div>
  );
}
