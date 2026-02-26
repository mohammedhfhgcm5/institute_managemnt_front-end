import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import { CreateSectionData, Section, UpdateSectionData } from '@/types/section.types';

export const sectionService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Section>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Section>>>(
      ENDPOINTS.SECTIONS,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Section> => {
    const response = await apiClient.get<ApiResponse<Section>>(
      ENDPOINTS.SECTION_BY_ID(id)
    );
    return response.data.data;
  },

  getByGrade: async (gradeId: number): Promise<Section[]> => {
    const response = await apiClient.get<ApiResponse<Section[]>>(
      ENDPOINTS.SECTIONS_BY_GRADE(gradeId)
    );
    return response.data.data;
  },

  create: async (data: CreateSectionData): Promise<Section> => {
    const response = await apiClient.post<ApiResponse<Section>>(
      ENDPOINTS.SECTIONS,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateSectionData): Promise<Section> => {
    const response = await apiClient.patch<ApiResponse<Section>>(
      ENDPOINTS.SECTION_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.SECTION_BY_ID(id));
  },
};
