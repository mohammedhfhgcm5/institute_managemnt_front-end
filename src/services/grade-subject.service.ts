import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/common.types';
import {
  CreateGradeSubjectData,
  GradeSubject,
  UpdateGradeSubjectData,
} from '@/types/grade-subject.types';

export const gradeSubjectService = {
  getAll: async (): Promise<GradeSubject[]> => {
    const response = await apiClient.get<ApiResponse<GradeSubject[]>>(
      ENDPOINTS.GRADE_SUBJECTS
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<GradeSubject> => {
    const response = await apiClient.get<ApiResponse<GradeSubject>>(
      ENDPOINTS.GRADE_SUBJECT_BY_ID(id)
    );
    return response.data.data;
  },

  getByGrade: async (gradeId: number): Promise<GradeSubject[]> => {
    const response = await apiClient.get<ApiResponse<GradeSubject[]>>(
      ENDPOINTS.GRADE_SUBJECTS_BY_GRADE(gradeId)
    );
    return response.data.data;
  },

  getByTeacher: async (teacherId: number): Promise<GradeSubject[]> => {
    const response = await apiClient.get<ApiResponse<GradeSubject[]>>(
      ENDPOINTS.GRADE_SUBJECTS_BY_TEACHER(teacherId)
    );
    return response.data.data;
  },

  create: async (data: CreateGradeSubjectData): Promise<GradeSubject> => {
    const response = await apiClient.post<ApiResponse<GradeSubject>>(
      ENDPOINTS.GRADE_SUBJECTS,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateGradeSubjectData): Promise<GradeSubject> => {
    const response = await apiClient.patch<ApiResponse<GradeSubject>>(
      ENDPOINTS.GRADE_SUBJECT_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.GRADE_SUBJECT_BY_ID(id));
  },
};
