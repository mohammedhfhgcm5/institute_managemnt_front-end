import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import { Grade, CreateGradeData, UpdateGradeData } from '@/types/grade.types';

export interface GradeStats {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}

export const gradeService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Grade>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Grade>>>(
      ENDPOINTS.GRADES,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Grade> => {
    const response = await apiClient.get<ApiResponse<Grade>>(
      ENDPOINTS.GRADE_BY_ID(id)
    );
    return response.data.data;
  },

  create: async (data: CreateGradeData): Promise<Grade> => {
    const response = await apiClient.post<ApiResponse<Grade>>(
      ENDPOINTS.GRADES,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateGradeData): Promise<Grade> => {
    const response = await apiClient.patch<ApiResponse<Grade>>(
      ENDPOINTS.GRADE_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.GRADE_BY_ID(id));
  },

  getStats: async (params?: Record<string, string>): Promise<GradeStats> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Grade>>>(
      ENDPOINTS.GRADES,
      { params }
    );
    const items = response.data.data.data ?? [];
    if (items.length === 0) {
      return { averageScore: 0, highestScore: 0, lowestScore: 0, passRate: 0 };
    }

    const scores = items
      .map((item) => Number((item as unknown as { score?: number }).score))
      .filter((score) => Number.isFinite(score));

    if (scores.length === 0) {
      return { averageScore: 0, highestScore: 0, lowestScore: 0, passRate: 0 };
    }

    const total = scores.reduce((sum, score) => sum + score, 0);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const averageScore = total / scores.length;
    const passCount = scores.filter((score) => score >= 50).length;
    const passRate = (passCount / scores.length) * 100;

    return { averageScore, highestScore, lowestScore, passRate };
  },
};
