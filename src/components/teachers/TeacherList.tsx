import { useState } from 'react';
import { useTeachers, useDeleteTeacher } from '@/hooks/api/useTeachers';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Teacher } from '@/types/teacher.types';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeacherForm } from './TeacherForm';
import { TeacherDetail } from './TeacherDetail';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function TeacherList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTeacherId, setDetailTeacherId] = useState<number | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useTeachers({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const deleteTeacher = useDeleteTeacher();

  const columns: Column<Teacher>[] = [
    { key: 'id', header: '#' },
    {
      key: 'name',
      header: 'الاسم',
      render: (t) => `${t.firstName} ${t.lastName}`,
    },
    { key: 'specialization', header: 'التخصص' },
    {
      key: 'experienceYears',
      header: 'سنوات الخبرة',
      render: (t) => t.experienceYears ?? '-',
    },
    {
      key: 'salary',
      header: 'الراتب',
      render: (t) => (t.salary ?? '-'),
    },
    {
      key: 'hireDate',
      header: 'تاريخ التوظيف',
      render: (t) => (t.hireDate ? formatDate(t.hireDate) : '-'),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (t) => (
        <Badge className={cn('text-xs', getStatusColor(t.status))}>
          {getStatusLabel(t.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      render: (t) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingTeacher(t);
              setFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(t.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
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
        searchPlaceholder="ابحث عن المعلمين..."
        onRowDoubleClick={(teacher) => {
          setDetailTeacherId(teacher.id);
          setDetailOpen(true);
        }}
        actions={
          <Button
            onClick={() => {
              setEditingTeacher(null);
              setFormOpen(true);
            }}
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة معلم
          </Button>
        }
      />

      <TeacherForm open={formOpen} onOpenChange={setFormOpen} teacher={editingTeacher} />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المعلم</DialogTitle>
          </DialogHeader>
          {detailTeacherId ? <TeacherDetail teacherId={detailTeacherId} /> : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="حذف المعلم"
        description="هل أنت متأكد من حذف هذا المعلم؟"
        onConfirm={() => {
          if (deletingId) {
            deleteTeacher.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
          }
        }}
        isLoading={deleteTeacher.isPending}
        confirmText="حذف"
      />
    </>
  );
}