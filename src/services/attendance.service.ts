import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import {
  Attendance,
  CreateAttendanceData,
  UpdateAttendanceData,
  AttendanceStats,
} from '@/types/attendance.types';

export const attendanceService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Attendance>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Attendance>>>(
      ENDPOINTS.ATTENDANCE,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Attendance> => {
    const response = await apiClient.get<ApiResponse<Attendance>>(
      ENDPOINTS.ATTENDANCE_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateAttendanceData): Promise<Attendance> => {
    const response = await apiClient.post<ApiResponse<Attendance>>(
      ENDPOINTS.ATTENDANCE,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateAttendanceData): Promise<Attendance> => {
    const response = await apiClient.patch<ApiResponse<Attendance>>(
      ENDPOINTS.ATTENDANCE_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.ATTENDANCE_BY_ID(id));
  },

  getStats: async (params?: Record<string, string>): Promise<AttendanceStats> => {
    const studentIdParam = params?.studentId;
    if (!studentIdParam) {
      throw new Error('studentId is required to fetch attendance stats');
    }
    const { studentId, ...queryParams } = params;
    const response = await apiClient.get<ApiResponse<AttendanceStats>>(
      ENDPOINTS.ATTENDANCE_STATS(Number(studentId)),
      { params: queryParams }
    );
    return response.data.data;
  },
};
