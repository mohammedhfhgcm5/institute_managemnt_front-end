import { useEffect, useMemo, useState } from 'react';
import { useTuitionFees, useDeleteTuitionFee } from '@/hooks/api/useTuitionFees';
import { useGrades } from '@/hooks/api/useGrades';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TuitionFee } from '@/types/tuition-fee.types';
import { formatCurrency } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/hooks/useLocale';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { TuitionFeeForm } from '@/components/tuition-fees/TuitionFeeForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TuitionFeesPage() {
  const { text } = useLocale();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [yearFilter, setYearFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<TuitionFee | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useTuitionFees();

  const { data: gradesData } = useGrades({
    page: 1,
    limit: 200,
  });

  const deleteFee = useDeleteTuitionFee();

  const gradeMap = useMemo(() => {
    const map = new Map<number, string>();
    (gradesData?.data || []).forEach((grade) => map.set(grade.id, grade.name));
    return map;
  }, [gradesData]);

  const fees = data || [];

  const filteredFees = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return fees.filter((fee) => {
      if (yearFilter !== 'all' && fee.academicYear !== yearFilter) return false;
      if (!term) return true;
      const gradeName =
        fee.grade?.name || gradeMap.get(fee.gradeId) || `#${fee.gradeId}`;
      return (
        gradeName.toLowerCase().includes(term) ||
        fee.academicYear.toLowerCase().includes(term) ||
        String(fee.annualAmount).includes(term)
      );
    });
  }, [debouncedSearch, fees, gradeMap, yearFilter]);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(fees.map((fee) => fee.academicYear)))
      .filter((year) => year)
      .sort()
      .reverse();
  }, [fees]);

  const limit = 10;
  const total = filteredFees.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const pageData = filteredFees.slice((safePage - 1) * limit, safePage * limit);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, yearFilter]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const columns: Column<TuitionFee>[] = [
    { key: 'id', header: '#' },
    {
      key: 'gradeId',
      header: text('الصف', 'Grade'),
      render: (fee) => fee.grade?.name || gradeMap.get(fee.gradeId) || `#${fee.gradeId}`,
    },
    {
      key: 'academicYear',
      header: text('السنة الدراسية', 'Academic Year'),
    },
    {
      key: 'annualAmount',
      header: text('المبلغ السنوي', 'Annual Amount'),
      render: (fee) => formatCurrency(fee.annualAmount),
    },
    {
      key: 'description',
      header: text('ملاحظات', 'Notes'),
      render: (fee) => fee.description || '-',
    },
    {
      key: 'actions',
      header: text('الإجراءات', 'Actions'),
      render: (fee) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingFee(fee);
              setFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(fee.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {text('إدارة الأقساط السنوية', 'Tuition Fees Management')}
      </h1>

      <DataTable
        columns={columns}
        data={pageData}
        total={total}
        page={safePage}
        limit={limit}
        totalPages={totalPages}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={text('بحث...', 'Search...')}
        actions={
          <>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={text('كل السنوات', 'All years')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text('كل السنوات', 'All years')}</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setEditingFee(null);
                setFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {text('إضافة قسط', 'Add Fee')}
            </Button>
          </>
        }
      />

      <TuitionFeeForm open={formOpen} onOpenChange={setFormOpen} fee={editingFee} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={text('حذف القسط', 'Delete Tuition Fee')}
        description={text('هل أنت متأكد من حذف هذا القسط؟', 'Are you sure you want to delete this tuition fee?')}
        onConfirm={() => {
          if (deletingId) deleteFee.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
        }}
        isLoading={deleteFee.isPending}
        confirmText={text('حذف', 'Delete')}
      />
    </div>
  );
}
