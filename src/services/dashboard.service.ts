import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/common.types';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalParents: number;
  attendanceRate: number;
  pendingPayments: number;
  totalRevenue: number;
  totalExpenses: number;
}

export interface AttendanceChartData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

export interface FinancialChartData {
  month: string;
  income: number;
  expenses: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      ENDPOINTS.DASHBOARD.STATS
    );
    return response.data.data;
  },

  getAttendanceChart: async (): Promise<AttendanceChartData[]> => {
    const response = await apiClient.get<ApiResponse<AttendanceChartData[]>>(
      ENDPOINTS.DASHBOARD.ATTENDANCE_CHART
    );
    return response.data.data;
  },

  getFinancialChart: async (): Promise<FinancialChartData[]> => {
    const response = await apiClient.get<ApiResponse<FinancialChartData[]>>(
      ENDPOINTS.DASHBOARD.FINANCIAL_CHART
    );
    return response.data.data;
  },

  getRecentActivities: async (): Promise<RecentActivity[]> => {
    const response = await apiClient.get<ApiResponse<RecentActivity[]>>(
      ENDPOINTS.DASHBOARD.RECENT_ACTIVITIES
    );
    return response.data.data;
  },
};