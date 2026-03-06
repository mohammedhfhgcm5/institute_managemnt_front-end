import { useState } from 'react';
import { useGrades, useDeleteGrade } from '@/hooks/api/useGrades';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Grade } from '@/types/grade.types';
import { formatDate } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { GradeForm } from '@/components/grades/GradeForm';

export default function GradesPage() {
  const { text } = useLocale();

  const gradeLevelLabel: Record<Grade['level'], string> = {
    preparatory: text('إعدادي', 'Preparatory'),
    secondary: text('ثانوي', 'Secondary'),
  };

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useGrades({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const deleteGrade = useDeleteGrade();

  const columns: Column<Grade>[] = [
    { key: 'id', header: '#' },
    { key: 'name', header: text('اسم الصف', 'Class Name') },
    {
      key: 'level',
      header: text('المستوى', 'Level'),
      render: (g) => gradeLevelLabel[g.level],
    },
    {
      key: 'description',
      header: text('الوصف', 'Description'),
      render: (g) => g.description || '-',
    },
    {
      key: 'createdAt',
      header: text('تاريخ الإنشاء', 'Created At'),
      render: (g) => formatDate(g.createdAt),
    },
    {
      key: 'actions',
      header: text('الإجراءات', 'Actions'),
      render: (g) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingGrade(g);
              setFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(g.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text('إدارة الصفوف', 'Class Management')}</h1>
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
        searchPlaceholder={text('ابحث عن صف...', 'Search class...')}
        actions={
          <Button
            onClick={() => {
              setEditingGrade(null);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {text('إضافة صف', 'Add Class')}
          </Button>
        }
      />

      <GradeForm open={formOpen} onOpenChange={setFormOpen} grade={editingGrade} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={text('حذف الصف', 'Delete Class')}
        description={text('هل أنت متأكد من حذف هذا الصف؟', 'Are you sure you want to delete this class?')}
        onConfirm={() => {
          if (deletingId) deleteGrade.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
        }}
        isLoading={deleteGrade.isPending}
        confirmText={text('حذف', 'Delete')}
      />
    </div>
  );
}
