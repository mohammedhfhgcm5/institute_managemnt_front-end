import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaymentStatus } from '@/types/common.types';

interface DashboardRecentPaymentApi {
  id: number;
  studentId: number;
  academicYear: string;
  amount: string;
  discount: string;
  finalAmount: string;
  status: PaymentStatus;
  dueDate: string;
  paymentDate: string | null;
  receiptNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  student: {
    firstName: string;
    lastName: string;
  };
}

interface DashboardFinancialSummaryApi {
  month: number;
  year: number;
  income: number;
  expenses: number;
  net: number;
  expensesByCategory: Array<{
    category: string;
    _sum: {
      amount: string | null;
    };
  }>;
}

interface DashboardAttendanceSummaryApi {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: string;
  topAbsentees: DashboardTopAbsentee[];
}

interface DashboardStatsApi {
  overview: DashboardOverview;
  todayAttendance: DashboardTodayAttendance;
  financial: DashboardFinancialSnapshot;
  assessments: DashboardAssessments;
  notifications: DashboardNotifications;
  gradeDistribution: DashboardGradeDistribution[];
  recentPayments: DashboardRecentPaymentApi[];
  recentAbsences: DashboardRecentAbsence[];
}

export interface DashboardOverview {
  students: {
    total: number;
    active: number;
  };
  teachers: {
    total: number;
    active: number;
  };
  parents: number;
  sections: number;
}

export interface DashboardTodayAttendance {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

export interface DashboardFinancialSnapshot {
  totalPaid: number;
  totalPending: number;
  totalPartial: number;
  totalExpenses: number;
  netBalance: number;
  budgetUsedPercentage: string;
}

export interface DashboardAssessments {
  total: number;
  averagePercentage: string;
  gradeDistribution: Array<{
    grade: string;
    _count: number;
  }>;
}

export interface DashboardNotifications {
  unread: number;
}

export interface DashboardGradeDistribution {
  gradeName: string;
  studentCount: number;
}

export interface DashboardRecentPayment {
  id: number;
  studentId: number;
  academicYear: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: PaymentStatus;
  dueDate: string;
  paymentDate: string | null;
  receiptNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  student: {
    firstName: string;
    lastName: string;
  };
}

export interface DashboardTopAbsentee {
  studentId?: number;
  studentName?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  absentCount?: number;
  totalAbsences?: number;
  [key: string]: unknown;
}

export type DashboardRecentAbsence = Record<string, unknown>;

export interface DashboardStats {
  overview: DashboardOverview;
  todayAttendance: DashboardTodayAttendance;
  financial: DashboardFinancialSnapshot;
  assessments: DashboardAssessments;
  notifications: DashboardNotifications;
  gradeDistribution: DashboardGradeDistribution[];
  recentPayments: DashboardRecentPayment[];
  recentAbsences: DashboardRecentAbsence[];
}

export interface DashboardFinancialSummary {
  month: number;
  year: number;
  income: number;
  expenses: number;
  net: number;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
}

export interface DashboardAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
  topAbsentees: DashboardTopAbsentee[];
}

export interface DashboardFinancialParams {
  month?: number;
  year?: number;
}

export interface DashboardAttendanceParams {
  dateFrom?: string;
  dateTo?: string;
}

const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapRecentPayment = (
  payment: DashboardRecentPaymentApi
): DashboardRecentPayment => ({
  ...payment,
  amount: toNumber(payment.amount),
  discount: toNumber(payment.discount),
  finalAmount: toNumber(payment.finalAmount),
});

const mapFinancialSummary = (
  summary: DashboardFinancialSummaryApi
): DashboardFinancialSummary => ({
  ...summary,
  expensesByCategory: summary.expensesByCategory.map((item) => ({
    category: item.category,
    amount: toNumber(item._sum.amount),
  })),
});

const mapAttendanceSummary = (
  summary: DashboardAttendanceSummaryApi
): DashboardAttendanceSummary => ({
  ...summary,
  attendanceRate: toNumber(summary.attendanceRate),
});

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStatsApi>>(
      ENDPOINTS.DASHBOARD.STATS
    );

    return {
      ...response.data.data,
      recentPayments: response.data.data.recentPayments.map(mapRecentPayment),
    };
  },

  getFinancialSummary: async (
    params?: DashboardFinancialParams
  ): Promise<DashboardFinancialSummary> => {
    const response = await apiClient.get<ApiResponse<DashboardFinancialSummaryApi>>(
      ENDPOINTS.DASHBOARD.FINANCIAL,
      { params }
    );

    return mapFinancialSummary(response.data.data);
  },

  getAttendanceSummary: async (
    params?: DashboardAttendanceParams
  ): Promise<DashboardAttendanceSummary> => {
    const response = await apiClient.get<ApiResponse<DashboardAttendanceSummaryApi>>(
      ENDPOINTS.DASHBOARD.ATTENDANCE,
      { params }
    );

    return mapAttendanceSummary(response.data.data);
  },
};
