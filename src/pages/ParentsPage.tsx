import { useState } from 'react';
import { useParents, useDeleteParent } from '@/hooks/api/useParents';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Parent } from '@/types/parent.types';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ParentForm } from '@/components/parents/ParentForm';

export default function ParentsPage() {
  const { text } = useLocale();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useParents({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const deleteParent = useDeleteParent();

  const columns: Column<Parent>[] = [
    { key: 'id', header: '#' },
    {
      key: 'name',
      header: text('الاسم', 'Name'),
      render: (p) => `${p.firstName} ${p.lastName}`,
    },
    { key: 'phone', header: text('الهاتف', 'Phone') },
    { key: 'email', header: text('البريد الإلكتروني', 'Email'), render: (p) => p.email || '-' },
    {
      key: 'actions',
      header: text('الإجراءات', 'Actions'),
      render: (p) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditingParent(p); setFormOpen(true); }}>
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
      <h1 className="text-2xl font-bold">{text('إدارة أولياء الأمور', 'Parent Management')}</h1>
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
        searchPlaceholder={text('بحث عن ولي أمر...', 'Search parent...')}
        actions={
          <Button onClick={() => { setEditingParent(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            {text('إضافة ولي أمر', 'Add Parent')}
          </Button>
        }
      />

      <ParentForm open={formOpen} onOpenChange={setFormOpen} parent={editingParent} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={text('حذف ولي الأمر', 'Delete Parent')}
        description={text('هل أنت متأكد من حذف ولي الأمر هذا؟', 'Are you sure you want to delete this parent?')}
        onConfirm={() => {
          if (deletingId) deleteParent.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
        }}
        isLoading={deleteParent.isPending}
        confirmText={text('حذف', 'Delete')}
      />
    </div>
  );
}
