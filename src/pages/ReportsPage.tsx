import { useState } from 'react';
import { useReports, useCreateReport, useDeleteReport } from '@/hooks/api/useReports';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { Report } from '@/types/report.types';
import { ReportType } from '@/types/common.types';
import { formatDateTime, getStatusLabel } from '@/utils/formatters';
import { useLocale } from '@/hooks/useLocale';
import { Plus, Trash2, Download, FileText, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const { text } = useLocale();

  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailReportId, setDetailReportId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<ReportType>('attendance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, isError, refetch } = useReports({ page, limit: 10 });
  const createReport = useCreateReport();
  const deleteReport = useDeleteReport();

  const handleOpenDetails = (report: Report) => {
    setDetailReportId(report.id);
    setDetailOpen(true);
  };

  const handleCreateReport = () => {
    createReport.mutate(
      {
        title: reportTitle,
        type: reportType,
        parameters: { startDate, endDate },
      },
      {
        onSuccess: () => {
          setFormOpen(false);
          setReportTitle('');
          setStartDate('');
          setEndDate('');
        },
      }
    );
  };

  const columns: Column<Report>[] = [
    { key: 'id', header: '#' },
    {
      key: 'title',
      header: text('العنوان', 'Title'),
      render: (r) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {r.title}
        </div>
      ),
    },
    {
      key: 'type',
      header: text('النوع', 'Type'),
      render: (r) => (
        <Badge variant="outline">{getStatusLabel(r.type)}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: text('تاريخ الإنشاء', 'Created At'),
      render: (r) => formatDateTime(r.createdAt),
    },
    {
      key: 'actions',
      header: text('الإجراءات', 'Actions'),
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.filePath && (
            <Button variant="ghost" size="icon" asChild>
              <a href={r.filePath} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(r.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text('التقارير', 'Reports')}</h1>

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
        onRowDoubleClick={handleOpenDetails}
        actions={
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {text('إنشاء تقرير', 'Create Report')}
          </Button>
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{text('إنشاء تقرير جديد', 'Create New Report')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{text('عنوان التقرير', 'Report Title')}</Label>
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder={text('أدخل العنوان', 'Enter title')}
              />
            </div>
            <div className="space-y-2">
              <Label>{text('نوع التقرير', 'Report Type')}</Label>
              <Select
                value={reportType}
                onValueChange={(val) => setReportType(val as ReportType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">{text('تقرير حضور', 'Attendance Report')}</SelectItem>
                  <SelectItem value="financial">{text('تقرير مالي', 'Financial Report')}</SelectItem>
                  <SelectItem value="performance">{text('تقرير أداء', 'Performance Report')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{text('من تاريخ', 'From date')}</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{text('إلى تاريخ', 'To date')}</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>{text('إلغاء', 'Cancel')}</Button>
            <Button onClick={handleCreateReport} disabled={!reportTitle || createReport.isPending}>
              {createReport.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {text('إنشاء', 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailReportId(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{text('تفاصيل التقرير', 'Report Details')}</DialogTitle>
          </DialogHeader>
          {detailReportId ? <ReportViewer reportId={detailReportId} /> : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={text('حذف التقرير', 'Delete Report')}
        description={text('هل أنت متأكد من حذف هذا التقرير؟', 'Are you sure you want to delete this report?')}
        onConfirm={() => {
          if (deletingId) deleteReport.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
        }}
        isLoading={deleteReport.isPending}
        confirmText={text('حذف', 'Delete')}
      />
    </div>
  );
}
