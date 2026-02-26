import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import { Report, CreateReportData } from '@/types/report.types';

export const reportService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Report>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Report>>>(
      ENDPOINTS.REPORTS,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Report> => {
    const response = await apiClient.get<ApiResponse<Report>>(
      ENDPOINTS.REPORT_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateReportData): Promise<Report> => {
    const response = await apiClient.post<ApiResponse<Report>>(
      ENDPOINTS.REPORTS,
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.REPORT_BY_ID(id));
  },
};