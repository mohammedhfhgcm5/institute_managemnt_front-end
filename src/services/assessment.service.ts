import { apiClient } from '@/api/config';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common.types';
import {
  Assessment,
  BulkCreateAssessmentData,
  BulkCreateAssessmentResult,
  CreateAssessmentData,
  UpdateAssessmentData,
} from '@/types/assessment.types';

export const assessmentService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Assessment>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Assessment>>>(
      ENDPOINTS.ASSESSMENTS,
      { params }
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Assessment> => {
    const response = await apiClient.get<ApiResponse<Assessment>>(
      ENDPOINTS.ASSESSMENT_BY_ID(id)
    );
    return response.data.data;
  },

  getByStudent: async (studentId: number): Promise<Assessment[]> => {
    const response = await apiClient.get<ApiResponse<Assessment[]>>(
      ENDPOINTS.ASSESSMENTS_BY_STUDENT(studentId)
    );
    return response.data.data;
  },

  create: async (data: CreateAssessmentData): Promise<Assessment> => {
    const response = await apiClient.post<ApiResponse<Assessment>>(
      ENDPOINTS.ASSESSMENTS,
      data
    );
    return response.data.data;
  },

  bulkCreate: async (
    data: BulkCreateAssessmentData
  ): Promise<BulkCreateAssessmentResult> => {
    const requests = data.students.map((studentItem) =>
      assessmentService.create({
        studentId: studentItem.studentId,
        gradeSubjectId: data.gradeSubjectId,
        type: data.type,
        title: data.title,
        maxScore: data.maxScore,
        score: studentItem.score,
        feedback: studentItem.feedback,
        assessmentDate: data.assessmentDate,
      })
    );

    const settled = await Promise.allSettled(requests);
    const created: Assessment[] = [];
    const errors: { studentId: number; message: string }[] = [];

    settled.forEach((result, index) => {
      const studentId = data.students[index].studentId;
      if (result.status === 'fulfilled') {
        created.push(result.value);
        return;
      }

      const error = result.reason as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      errors.push({
        studentId,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create assessment',
      });
    });

    return {
      successCount: created.length,
      failureCount: errors.length,
      created,
      errors,
    };
  },

  update: async (id: number, data: UpdateAssessmentData): Promise<Assessment> => {
    const response = await apiClient.patch<ApiResponse<Assessment>>(
      ENDPOINTS.ASSESSMENT_BY_ID(id),
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.ASSESSMENT_BY_ID(id));
  },
};
