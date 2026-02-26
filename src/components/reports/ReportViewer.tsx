import { useState } from 'react';
import { useReport } from '@/hooks/api/useReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatDateTime, getStatusLabel } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportViewerProps {
  reportId: number;
}

type ExportFormat = 'excel' | 'pdf';
type ExcelCellValue = string | number | boolean | null;
type ExcelRow = Record<string, ExcelCellValue>;

function normalizeCellValue(value: unknown): ExcelCellValue {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function toExcelRows(data: unknown): ExcelRow[] {
  if (Array.isArray(data)) {
    if (data.length === 0) return [];

    const isArrayOfObjects = data.every(
      (item) => item !== null && typeof item === 'object' && !Array.isArray(item)
    );

    if (isArrayOfObjects) {
      return data.map((item) => {
        const row: ExcelRow = {};
        Object.entries(item as Record<string, unknown>).forEach(([key, value]) => {
          row[key] = normalizeCellValue(value);
        });
        return row;
      });
    }

    return data.map((item, index) => ({
      index: index + 1,
      value: normalizeCellValue(item),
    }));
  }

  if (data !== null && typeof data === 'object') {
    return Object.entries(data as Record<string, unknown>).map(([field, value]) => ({
      field,
      value: normalizeCellValue(value),
    }));
  }

  return [{ value: normalizeCellValue(data) }];
}

function buildFileBaseName(title: string, reportId: number): string {
  const safeTitle = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 50);
  return `${safeTitle || 'report'}-${reportId}`;
}

async function exportJsonToExcel(data: unknown, fileBaseName: string) {
  const XLSX = await import('xlsx');
  const rows = toExcelRows(data);
  const sheetData = rows.length > 0 ? rows : [{ value: 'No data available' }];
  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${fileBaseName}.xlsx`);
}

async function exportJsonToPdf(title: string, data: unknown, fileBaseName: string) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const lineHeight = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(14);
  doc.text(title, margin, margin);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 18);
  doc.setFont('courier', 'normal');

  const jsonText = JSON.stringify(data, null, 2) || 'No data available';
  const lines = doc.splitTextToSize(jsonText, pageWidth - margin * 2);
  let y = margin + 42;

  lines.forEach((line: string) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save(`${fileBaseName}.pdf`);
}

export function ReportViewer({ reportId }: ReportViewerProps) {
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
      toast.error('No JSON data available to export.');
      return;
    }

    setExportingFormat(format);
    const fileBaseName = buildFileBaseName(report.title, report.id);

    try {
      if (format === 'excel') {
        await exportJsonToExcel(report.data, fileBaseName);
      } else {
        await exportJsonToPdf(report.title, report.data, fileBaseName);
      }
      toast.success(`${format.toUpperCase()} downloaded successfully.`);
    } catch (error) {
      console.error('Local export failed:', error);
      toast.error('Failed to export report file.');
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
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium">{getStatusLabel(report.type)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Format</p>
            <p className="font-medium uppercase">{report.format}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created At</p>
            <p className="font-medium">{formatDateTime(report.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Generated At</p>
            <p className="font-medium">{formatDateTime(report.generatedAt)}</p>
          </div>
          {report.periodStart && (
            <div>
              <p className="text-muted-foreground">Period Start</p>
              <p className="font-medium">{formatDateTime(report.periodStart)}</p>
            </div>
          )}
          {report.periodEnd && (
            <div>
              <p className="text-muted-foreground">Period End</p>
              <p className="font-medium">{formatDateTime(report.periodEnd)}</p>
            </div>
          )}
        </div>

        {hasParameters && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Parameters</p>
            <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(report.parameters, null, 2)}
            </pre>
          </div>
        )}

        {hasData && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Data</p>
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
            Export Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={isExporting || !hasData}
          >
            {exportingFormat === 'pdf' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Export PDF
          </Button>
        </div>

        {report.filePath ? (
          <a
            href={report.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-primary underline"
          >
            Download report
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">No downloadable file is available for this report.</p>
        )}

        <p className="text-xs text-muted-foreground">Report ID: {report.id}</p>
      </CardContent>
    </Card>
  );
}
