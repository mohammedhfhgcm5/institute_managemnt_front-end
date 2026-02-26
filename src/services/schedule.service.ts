import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/common.types';
import { CreateScheduleData, Schedule, UpdateScheduleData } from '@/types/schedule.types';

export const scheduleService = {
  getAll: async (): Promise<Schedule[]> => {
    const response = await apiClient.get<ApiResponse<Schedule[]>>(
      ENDPOINTS.SCHEDULES
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Schedule> => {
    const response = await apiClient.get<ApiResponse<Schedule>>(
      ENDPOINTS.SCHEDULE_BY_ID(id)
    );
    return response.data.data;
  },

  getBySection: async (sectionId: number): Promise<Schedule[]> => {
    const response = await apiClient.get<ApiResponse<Schedule[]>>(
      ENDPOINTS.SCHEDULES_BY_SECTION(sectionId)
    );
    return response.data.data;
  },

  getByTeacher: async (teacherId: number): Promise<Schedule[]> => {
    const response = await apiClient.get<ApiResponse<Schedule[]>>(
      ENDPOINTS.SCHEDULES_BY_TEACHER(teacherId)
    );
    return response.data.data;
  },

  create: async (data: CreateScheduleData): Promise<Schedule> => {
    const response = await apiClient.post<ApiResponse<Schedule>>(
      ENDPOINTS.SCHEDULES,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateScheduleData): Promise<Schedule> => {
    const response = await apiClient.patch<ApiResponse<Schedule>>(
      ENDPOINTS.SCHEDULE_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.SCHEDULE_BY_ID(id));
  },
};
