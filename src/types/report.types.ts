import { ReportFormat, ReportType } from './common.types';

export interface Report {
  id: number;
  generatedBy?: number;
  type: ReportType;
  title: string;
  parameters?: Record<string, unknown>;
  data?: unknown;
  format: ReportFormat;
  filePath?: string;
  periodStart?: string;
  periodEnd?: string;
  generatedAt: string;
  createdAt: string;
}

export interface CreateReportData {
  type: ReportType;
  title: string;
  parameters?: Record<string, unknown>;
  format?: ReportFormat;
  periodStart?: string;
  periodEnd?: string;
}

export interface ReportFilters {
  type?: ReportType;
  startDate?: string;
  endDate?: string;
}
