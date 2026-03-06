import { useState } from 'react';
import { useExpenses, useDeleteExpense } from '@/hooks/api/useExpenses';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Expense } from '@/types/expense.types';
import { formatDate, formatCurrency, getStatusLabel } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ExpensesPage() {
  const { text } = useLocale();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useExpenses({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const deleteExpense = useDeleteExpense();

  const columns: Column<Expense>[] = [
    { key: 'id', header: '#' },
    { key: 'description', header: text('الوصف', 'Description') },
    {
      key: 'category',
      header: text('التصنيف', 'Category'),
      render: (e) => (
        <Badge variant="outline">{getStatusLabel(e.category)}</Badge>
      ),
    },
    {
      key: 'amount',
      header: text('المبلغ', 'Amount'),
      render: (e) => formatCurrency(e.amount),
    },
    {
      key: 'expenseDate',
      header: text('التاريخ', 'Date'),
      render: (e) => formatDate(e.expenseDate),
    },
    {
      key: 'receiptNumber',
      header: text('رقم الإيصال', 'Receipt No.'),
      render: (e) => e.receiptNumber || '-',
    },
    {
      key: 'actions',
      header: text('الإجراءات', 'Actions'),
      render: (e) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditingExpense(e); setFormOpen(true); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(e.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text('إدارة المصروفات', 'Expense Management')}</h1>
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
          <Button onClick={() => { setEditingExpense(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            {text('إضافة مصروف', 'Add Expense')}
          </Button>
        }
      />

      <ExpenseForm open={formOpen} onOpenChange={setFormOpen} expense={editingExpense} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={text('حذف المصروف', 'Delete Expense')}
        description={text('هل أنت متأكد من حذف هذا المصروف؟', 'Are you sure you want to delete this expense?')}
        onConfirm={() => {
          if (deletingId) deleteExpense.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
        }}
        isLoading={deleteExpense.isPending}
        confirmText={text('حذف', 'Delete')}
      />
    </div>
  );
}
