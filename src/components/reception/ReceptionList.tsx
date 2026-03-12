import { useState } from 'react';
import { useReceptions, useDeleteReception } from '@/hooks/api/useReceptions';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Reception } from '@/types/reception.types';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { ReceptionForm } from './ReceptionForm';
import { ReceptionAccountForm } from './ReceptionAccountForm';
import { cn } from '@/lib/utils';

export function ReceptionList() {
  const { text } = useLocale();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [accountReception, setAccountReception] = useState<Reception | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useReceptions({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const deleteReception = useDeleteReception();

  const columns: Column<Reception>[] = [
    { key: 'id', header: '#' },
    {
      key: 'name',
      header: text('الاسم', 'Name'),
      render: (r) => `${r.firstName} ${r.lastName}`,
    },
    { key: 'phone', header: text('رقم الهاتف', 'Phone') },
    { key: 'email', header: text('البريد الإلكتروني', 'Email') },
    {
      key: 'account',
      header: text('الحساب', 'Account'),
      render: (r) => (
        <Badge variant={r.userId ? 'secondary' : 'outline'}>
          {r.userId ? text('مرتبط', 'Linked') : text('غير مرتبط', 'Not linked')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: text('الإجراءات', 'Actions'),
      render: (r) => {
        const hasAccount = !!r.userId;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingReception(r);
                setFormOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeletingId(r.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={hasAccount}
              onClick={() => {
                setAccountReception(r);
                setAccountOpen(true);
              }}
              title={hasAccount ? text('الحساب مرتبط بالفعل', 'Account already linked') : undefined}
            >
              <UserPlus className={cn('h-4 w-4', hasAccount && 'text-muted-foreground')} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
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
        searchPlaceholder={text('ابحث عن موظف الاستقبال...', 'Search reception...')}
        actions={
          <Button
            onClick={() => {
              setEditingReception(null);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {text('إضافة استقبال', 'Add Reception')}
          </Button>
        }
      />

      <ReceptionForm open={formOpen} onOpenChange={setFormOpen} reception={editingReception} />

      <ReceptionAccountForm
        open={accountOpen}
        onOpenChange={setAccountOpen}
        reception={accountReception}
      />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={text('حذف الاستقبال', 'Delete Reception')}
        description={text(
          'هل أنت متأكد من حذف موظف الاستقبال هذا؟',
          'Are you sure you want to delete this reception?'
        )}
        onConfirm={() => {
          if (deletingId) {
            deleteReception.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
          }
        }}
        isLoading={deleteReception.isPending}
        confirmText={text('حذف', 'Delete')}
      />
    </>
  );
}
