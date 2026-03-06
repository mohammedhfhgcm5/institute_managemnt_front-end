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
import { useLocale } from '@/hooks/useLocale';
import { Plus, Edit, Trash2, CheckCircle, Clock, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentForm } from '@/components/payments/PaymentForm';

export default function PaymentsPage() {
  const { text } = useLocale();

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
    { key: 'studentId', header: text('رقم الطالب', 'Student ID') },
    { key: 'academicYear', header: text('السنة الدراسية', 'Academic Year') },
    {
      key: 'amount',
      header: text('المبلغ', 'Amount'),
      render: (p) => formatCurrency(p.amount),
    },
    {
      key: 'discount',
      header: text('الخصم', 'Discount'),
      render: (p) => formatCurrency(p.discount),
    },
    {
      key: 'dueDate',
      header: text('تاريخ الاستحقاق', 'Due Date'),
      render: (p) => formatDate(p.dueDate),
    },
    {
      key: 'status',
      header: text('الحالة', 'Status'),
      render: (p) => (
        <Badge className={cn('text-xs', getStatusColor(p.status))}>
          {getStatusLabel(p.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: text('الإجراءات', 'Actions'),
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
      <h1 className="text-2xl font-bold">{text('المدفوعات', 'Payments')}</h1>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title={text('مدفوع', 'Paid')}
            value={formatCurrency(stats.totalPaid)}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title={text('قيد الانتظار', 'Pending')}
            value={formatCurrency(stats.totalPending)}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
          <StatCard
            title={text('جزئي', 'Partial')}
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
        searchPlaceholder={text('بحث...', 'Search...')}
        actions={
          <Button onClick={() => { setEditingPayment(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            {text('إضافة دفعة', 'Add Payment')}
          </Button>
        }
      />

      <PaymentForm open={formOpen} onOpenChange={setFormOpen} payment={editingPayment} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={text('حذف الدفعة', 'Delete Payment')}
        description={text('هل أنت متأكد من حذف هذه الدفعة؟', 'Are you sure you want to delete this payment?')}
        onConfirm={() => {
          if (deletingId) deletePayment.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
        }}
        isLoading={deletePayment.isPending}
        confirmText={text('حذف', 'Delete')}
      />
    </div>
  );
}
