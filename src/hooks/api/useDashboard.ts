import { useQuery } from '@tanstack/react-query';
import {
  dashboardService,
  DashboardAttendanceParams,
  DashboardFinancialParams,
} from '@/services/dashboard.service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  attendanceSummary: (params?: DashboardAttendanceParams) =>
    [...dashboardKeys.all, 'attendance-summary', params] as const,
  financialSummary: (params?: DashboardFinancialParams) =>
    [...dashboardKeys.all, 'financial-summary', params] as const,
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
  });
};

export const useAttendanceSummary = (params?: DashboardAttendanceParams) => {
  return useQuery({
    queryKey: dashboardKeys.attendanceSummary(params),
    queryFn: () => dashboardService.getAttendanceSummary(params),
  });
};

export const useFinancialSummary = (params?: DashboardFinancialParams) => {
  return useQuery({
    queryKey: dashboardKeys.financialSummary(params),
    queryFn: () => dashboardService.getFinancialSummary(params),
  });
};
