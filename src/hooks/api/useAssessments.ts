import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessment.service';
import { PaginationParams } from '@/types/common.types';
import {
  BulkCreateAssessmentData,
  CreateAssessmentData,
  UpdateAssessmentData,
} from '@/types/assessment.types';
import { localize } from '@/i18n/localize';
import { toast } from 'sonner';

export const assessmentKeys = {
  all: ['assessments'] as const,
  lists: () => [...assessmentKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...assessmentKeys.lists(), params] as const,
  details: () => [...assessmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...assessmentKeys.details(), id] as const,
  byStudent: (studentId: number) =>
    [...assessmentKeys.all, 'student', studentId] as const,
};

export const useAssessments = (params?: PaginationParams) =>
  useQuery({
    queryKey: assessmentKeys.list(params),
    queryFn: () => assessmentService.getAll(params),
  });

export const useAssessment = (id: number) =>
  useQuery({
    queryKey: assessmentKeys.detail(id),
    queryFn: () => assessmentService.getById(id),
    enabled: !!id,
  });

export const useAssessmentsByStudent = (studentId: number) =>
  useQuery({
    queryKey: assessmentKeys.byStudent(studentId),
    queryFn: () => assessmentService.getByStudent(studentId),
    enabled: !!studentId,
  });

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssessmentData) => assessmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
      toast.success(localize('تم إضافة التقييم بنجاح', 'Assessment created successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useBulkCreateAssessments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkCreateAssessmentData) =>
      assessmentService.bulkCreate(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
      if (result.failureCount === 0) {
        toast.success(localize('تم إنشاء جميع التقييمات بنجاح', 'All assessments were created successfully'));
        return;
      }

      if (result.successCount > 0) {
        toast.warning(
          localize(
            `تم إنشاء ${result.successCount} تقييم، وفشل ${result.failureCount}`,
            `${result.successCount} assessments created, ${result.failureCount} failed`
          )
        );
        return;
      }

      toast.error(localize('فشل إنشاء التقييمات', 'Failed to create assessments'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAssessmentData }) =>
      assessmentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.detail(variables.id),
      });
      toast.success(localize('تم تحديث التقييم بنجاح', 'Assessment updated successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => assessmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
      toast.success(localize('تم حذف التقييم بنجاح', 'Assessment deleted successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ', 'Something went wrong'));
    },
  });
};
