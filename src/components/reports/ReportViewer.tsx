import { useState } from 'react';
import { useReport } from '@/hooks/api/useReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatDateTime, getStatusLabel } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportJsonToExcel, exportJsonToPdf } from '@/lib/exportUtils';

interface ReportViewerProps {
  reportId: number;
}

type ExportFormat = 'excel' | 'pdf';

function buildFileBaseName(title: string, reportId: number): string {
  const safeTitle = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 50);
  return `${safeTitle || 'report'}-${reportId}`;
}

export function ReportViewer({ reportId }: ReportViewerProps) {
  const { text } = useLocale();
  const { data: report, isLoading, isError, refetch } = useReport(reportId);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !report) return <ErrorMessage onRetry={() => refetch()} />;

  const hasParameters = report.parameters && Object.keys(report.parameters).length > 0;
  const hasData = report.data !== null && report.data !== undefined;
  const isExporting = exportingFormat !== null;

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) return;
    if (!hasData) {
      toast.error(text('لا توجد بيانات JSON متاحة للتصدير.', 'No JSON data available to export.'));
      return;
    }

    setExportingFormat(format);
    const fileBaseName = buildFileBaseName(report.title, report.id);
    const reportData = report.data as Record<string, unknown>;

    try {
      if (format === 'excel') {
        await exportJsonToExcel(reportData, fileBaseName);
      } else {
        await exportJsonToPdf(report.title, reportData, fileBaseName);
      }
      toast.success(
        text(
          `تم تنزيل ملف ${format.toUpperCase()} بنجاح`,
          `${format.toUpperCase()} downloaded successfully`
        )
      );
    } catch (error) {
      console.error('Local export failed:', error);
      toast.error(text('فشل تصدير ملف التقرير.', 'Failed to export report file.'));
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{report.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">{text('النوع', 'Type')}</p>
            <p className="font-medium">{getStatusLabel(report.type)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{text('الصيغة', 'Format')}</p>
            <p className="font-medium uppercase">{report.format}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{text('تاريخ الإنشاء', 'Created At')}</p>
            <p className="font-medium">{formatDateTime(report.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{text('تاريخ التوليد', 'Generated At')}</p>
            <p className="font-medium">{formatDateTime(report.generatedAt)}</p>
          </div>
          {report.periodStart && (
            <div>
              <p className="text-muted-foreground">{text('بداية الفترة', 'Period Start')}</p>
              <p className="font-medium">{formatDateTime(report.periodStart)}</p>
            </div>
          )}
          {report.periodEnd && (
            <div>
              <p className="text-muted-foreground">{text('نهاية الفترة', 'Period End')}</p>
              <p className="font-medium">{formatDateTime(report.periodEnd)}</p>
            </div>
          )}
        </div>

        {hasParameters && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{text('المعلمات', 'Parameters')}</p>
            <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(report.parameters, null, 2)}
            </pre>
          </div>
        )}

        {hasData && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{text('البيانات', 'Data')}</p>
            <pre className="max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(report.data, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            disabled={isExporting || !hasData}
          >
            {exportingFormat === 'excel' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {text('تصدير Excel', 'Export Excel')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={isExporting || !hasData}
          >
            {exportingFormat === 'pdf' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {text('تصدير PDF', 'Export PDF')}
          </Button>
        </div>

        {report.filePath ? (
          <a
            href={report.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-primary underline"
          >
            {text('تنزيل التقرير', 'Download report')}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">
            {text('لا يوجد ملف قابل للتنزيل لهذا التقرير.', 'No downloadable file is available for this report.')}
          </p>
        )}

        <p className="text-xs text-muted-foreground">{text('رقم التقرير', 'Report ID')}: {report.id}</p>
      </CardContent>
    </Card>
  );
}
