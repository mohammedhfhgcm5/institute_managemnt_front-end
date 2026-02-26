import { useState } from 'react';
import { useStudents, useDeleteStudent } from '@/hooks/api/useStudents';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Student } from '@/types/student.types';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StudentForm } from './StudentForm';

export function StudentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useStudents({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const deleteStudent = useDeleteStudent();

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteStudent.mutate(deletingId, {
        onSuccess: () => setDeletingId(null),
      });
    }
  };

  const columns: Column<Student>[] = [
    { key: 'id', header: '#' },
    {
      key: 'name',
      header: 'الاسم',
      render: (student) => `${student.firstName} ${student.lastName}`,
    },
    {
      key: 'academicYear',
      header: 'السنة الدراسية',
      render: (student) => student.academicYear || '-',
    },
    {
      key: 'gender',
      header: 'الجنس',
      render: (student) => getStatusLabel(student.gender),
    },
    {
      key: 'registrationDate',
      header: 'تاريخ التسجيل',
      render: (student) => formatDate(student.registrationDate),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (student) => (
        <Badge className={cn('text-xs', getStatusColor(student.status))}>
          {getStatusLabel(student.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      render: (student) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(student.id)}>
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
        searchPlaceholder="ابحث عن الطلاب..."
        actions={
          <Button onClick={() => { setEditingStudent(null); setFormOpen(true); }}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة طالب
          </Button>
        }
      />

      <StudentForm open={formOpen} onOpenChange={setFormOpen} student={editingStudent} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="حذف الطالب"
        description="هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        isLoading={deleteStudent.isPending}
        confirmText="حذف"
      />
    </>
  );
}