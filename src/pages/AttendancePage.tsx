import { useState } from 'react';
import { useAttendanceList, useDeleteAttendance } from '@/hooks/api/useAttendance';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Attendance } from '@/types/attendance.types';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceForm } from '@/components/attendance/AttendanceForm';

export default function AttendancePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useAttendanceList({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const deleteAttendance = useDeleteAttendance();

  const columns: Column<Attendance>[] = [
    { key: 'id', header: '#' },
    { key: 'studentId', header: 'رقم الطالب' },
    { key: 'scheduleId', header: 'رقم الجدول' },
    {
      key: 'date',
      header: 'التاريخ',
      render: (a) => formatDate(a.date),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (a) => (
        <Badge className={cn('text-xs', getStatusColor(a.status))}>
          {getStatusLabel(a.status)}
        </Badge>
      ),
    },
    { key: 'notes', header: 'ملاحظات', render: (a) => a.notes || '-' },
    {
      key: 'actions',
      header: 'الإجراءات',
      render: (a) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditingRecord(a); setFormOpen(true); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(a.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة الحضور</h1>
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
        searchPlaceholder="بحث..."
        actions={
          <Button onClick={() => { setEditingRecord(null); setFormOpen(true); }}>
            <Plus className="ml-2 h-4 w-4" />
            تسجيل حضور
          </Button>
        }
      />

      <AttendanceForm open={formOpen} onOpenChange={setFormOpen} attendance={editingRecord} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="حذف سجل الحضور"
        description="هل أنت متأكد من حذف هذا السجل؟"
        onConfirm={() => {
          if (deletingId) deleteAttendance.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
        }}
        isLoading={deleteAttendance.isPending}
        confirmText="حذف"
      />
    </div>
  );
}
