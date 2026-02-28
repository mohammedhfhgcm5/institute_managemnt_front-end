import { apiClient } from "@/api/config";
import { ENDPOINTS } from "@/api/endpoints";
import {
  ApiResponse,
  PaginatedMeta,
  PaginatedResponse,
  PaginationParams,
} from "@/types/common.types";
import {
  Attendance,
  CreateAttendanceData,
  UpdateAttendanceData,
  AttendanceStats,
  AttendanceFilterParams,
} from "@/types/attendance.types";

interface AttendanceStatsApiResponse {
  total?: number;
  present?: number;
  absent?: number;
  late?: number;
  excused?: number;
  attendanceRate?: number | string;
  totalPresent?: number;
  totalAbsent?: number;
  totalLate?: number;
  totalExcused?: number;
}

type AttendanceListQueryParams = PaginationParams & AttendanceFilterParams;

interface AttendanceStatsQueryParams {
  studentId?: string | number;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | number | undefined;
}

const buildDefaultMeta = (itemsCount: number): PaginatedMeta => ({
  total: itemsCount,
  page: 1,
  limit: Math.max(itemsCount, 1),
  totalPages: 1,
});

const normalizeAttendanceListResponse = (
  responseData: PaginatedResponse<Attendance> | Attendance[],
): PaginatedResponse<Attendance> => {
  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      meta: buildDefaultMeta(responseData.length),
    };
  }

  const items = Array.isArray(responseData.data) ? responseData.data : [];
  const meta = responseData.meta;

  return {
    data: items,
    meta: {
      total: typeof meta?.total === "number" ? meta.total : items.length,
      page: typeof meta?.page === "number" ? meta.page : 1,
      limit:
        typeof meta?.limit === "number"
          ? meta.limit
          : Math.max(items.length, 1),
      totalPages:
        typeof meta?.totalPages === "number" ? Math.max(meta.totalPages, 1) : 1,
    },
  };
};

const toPositiveNumber = (value: unknown): number | undefined => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
};

const sanitizeAttendanceListParams = (
  params?: AttendanceListQueryParams,
): AttendanceFilterParams => {
  if (!params) return {};

  const cleaned: AttendanceFilterParams = {};
  const studentId = toPositiveNumber(params.studentId);
  const scheduleId = toPositiveNumber(params.scheduleId);

  if (studentId) cleaned.studentId = studentId;
  if (scheduleId) cleaned.scheduleId = scheduleId;

  if (typeof params.dateFrom === "string" && params.dateFrom.trim()) {
    cleaned.dateFrom = params.dateFrom.trim();
  }
  if (typeof params.dateTo === "string" && params.dateTo.trim()) {
    cleaned.dateTo = params.dateTo.trim();
  }

  if (
    params.status === "present" ||
    params.status === "absent" ||
    params.status === "late" ||
    params.status === "excused"
  ) {
    cleaned.status = params.status;
  }

  return cleaned;
};

const normalizeAttendanceStats = (
  responseData: AttendanceStatsApiResponse,
): AttendanceStats => {
  const toNumber = (value: unknown): number => {
    const parsed = typeof value === "number" ? value : Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    totalPresent: toNumber(responseData.totalPresent ?? responseData.present),
    totalAbsent: toNumber(responseData.totalAbsent ?? responseData.absent),
    totalLate: toNumber(responseData.totalLate ?? responseData.late),
    totalExcused: toNumber(responseData.totalExcused ?? responseData.excused),
    attendanceRate: toNumber(responseData.attendanceRate),
  };
};

export const attendanceService = {
  getAll: async (
    params?: AttendanceListQueryParams,
  ): Promise<PaginatedResponse<Attendance>> => {
    const queryParams = sanitizeAttendanceListParams(params);
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Attendance> | Attendance[]>
    >(ENDPOINTS.ATTENDANCE, { params: queryParams });
    return normalizeAttendanceListResponse(response.data.data);
  },

  getById: async (id: number): Promise<Attendance> => {
    const response = await apiClient.get<ApiResponse<Attendance>>(
      ENDPOINTS.ATTENDANCE_BY_ID(id),
    );
    return response.data.data;
  },

  create: async (data: CreateAttendanceData): Promise<Attendance> => {
    const response = await apiClient.post<ApiResponse<Attendance>>(
      ENDPOINTS.ATTENDANCE,
      data,
    );
    return response.data.data;
  },

  update: async (
    id: number,
    data: UpdateAttendanceData,
  ): Promise<Attendance> => {
    const response = await apiClient.patch<ApiResponse<Attendance>>(
      ENDPOINTS.ATTENDANCE_BY_ID(id),
      data,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.ATTENDANCE_BY_ID(id));
  },

  getStats: async (
    params?: AttendanceStatsQueryParams,
  ): Promise<AttendanceStats> => {
    const studentIdParam = params?.studentId;
    if (!studentIdParam) {
      throw new Error("studentId is required to fetch attendance stats");
    }
    const studentId = Number(studentIdParam);
    if (!Number.isFinite(studentId) || studentId <= 0) {
      throw new Error("studentId must be a valid positive number");
    }

    const { studentId: _, ...queryParams } = params;
    const response = await apiClient.get<
      ApiResponse<AttendanceStatsApiResponse>
    >(ENDPOINTS.ATTENDANCE_STATS(studentId), { params: queryParams });
    return normalizeAttendanceStats(response.data.data);
  },
};
