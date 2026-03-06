import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import { PaginationParams } from '@/types/common.types';
import { CreateStudentData, UpdateStudentData } from '@/types/student.types';
import { localize } from '@/i18n/localize';
import { toast } from 'sonner';

export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: number) => [...studentKeys.details(), id] as const,
  bySection: (sectionId: number) => [...studentKeys.all, 'section', sectionId] as const,
};

export const useStudents = (params?: PaginationParams) => {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentService.getAll(params),
  });
};

export const useStudent = (id: number) => {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentService.getById(id),
    enabled: !!id,
  });
};

export const useStudentsBySection = (sectionId: number) => {
  return useQuery({
    queryKey: studentKeys.bySection(sectionId),
    queryFn: () => studentService.getBySection(sectionId),
    enabled: !!sectionId,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentData) => studentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(localize('تم إضافة الطالب بنجاح', 'Student created successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ أثناء إضافة الطالب', 'Failed to create student'));
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentData }) =>
      studentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) });
      toast.success(localize('تم تحديث بيانات الطالب بنجاح', 'Student updated successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ أثناء التحديث', 'Failed to update student'));
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(localize('تم حذف الطالب بنجاح', 'Student deleted successfully'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || localize('حدث خطأ أثناء الحذف', 'Failed to delete student'));
    },
  });
};
