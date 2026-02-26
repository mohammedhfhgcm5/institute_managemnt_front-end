import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  attendanceChart: () => [...dashboardKeys.all, 'attendance-chart'] as const,
  financialChart: () => [...dashboardKeys.all, 'financial-chart'] as const,
  recentActivities: () => [...dashboardKeys.all, 'recent-activities'] as const,
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
  });
};

export const useAttendanceChart = () => {
  return useQuery({
    queryKey: dashboardKeys.attendanceChart(),
    queryFn: () => dashboardService.getAttendanceChart(),
  });
};

export const useFinancialChart = () => {
  return useQuery({
    queryKey: dashboardKeys.financialChart(),
    queryFn: () => dashboardService.getFinancialChart(),
  });
};

export const useRecentActivities = () => {
  return useQuery({
    queryKey: dashboardKeys.recentActivities(),
    queryFn: () => dashboardService.getRecentActivities(),
  });
};