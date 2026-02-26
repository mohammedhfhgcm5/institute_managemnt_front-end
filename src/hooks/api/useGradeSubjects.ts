import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeSubjectService } from '@/services/grade-subject.service';
import {
  CreateGradeSubjectData,
  UpdateGradeSubjectData,
} from '@/types/grade-subject.types';
import { toast } from 'sonner';

export const gradeSubjectKeys = {
  all: ['grade-subjects'] as const,
  lists: () => [...gradeSubjectKeys.all, 'list'] as const,
  details: () => [...gradeSubjectKeys.all, 'detail'] as const,
  detail: (id: number) => [...gradeSubjectKeys.details(), id] as const,
  byGrade: (gradeId: number) => [...gradeSubjectKeys.all, 'grade', gradeId] as const,
  byTeacher: (teacherId: number) =>
    [...gradeSubjectKeys.all, 'teacher', teacherId] as const,
};

export const useGradeSubjects = () =>
  useQuery({
    queryKey: gradeSubjectKeys.lists(),
    queryFn: () => gradeSubjectService.getAll(),
  });

export const useGradeSubject = (id: number) =>
  useQuery({
    queryKey: gradeSubjectKeys.detail(id),
    queryFn: () => gradeSubjectService.getById(id),
    enabled: !!id,
  });

export const useGradeSubjectsByGrade = (gradeId: number) =>
  useQuery({
    queryKey: gradeSubjectKeys.byGrade(gradeId),
    queryFn: () => gradeSubjectService.getByGrade(gradeId),
    enabled: !!gradeId,
  });

export const useGradeSubjectsByTeacher = (teacherId: number) =>
  useQuery({
    queryKey: gradeSubjectKeys.byTeacher(teacherId),
    queryFn: () => gradeSubjectService.getByTeacher(teacherId),
    enabled: !!teacherId,
  });

export const useCreateGradeSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGradeSubjectData) => gradeSubjectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeSubjectKeys.all });
      toast.success('تم إنشاء ربط مادة الصف بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useUpdateGradeSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGradeSubjectData }) =>
      gradeSubjectService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gradeSubjectKeys.all });
      queryClient.invalidateQueries({ queryKey: gradeSubjectKeys.detail(variables.id) });
      toast.success('تم تحديث ربط مادة الصف بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useDeleteGradeSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gradeSubjectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeSubjectKeys.all });
      toast.success('تم حذف ربط مادة الصف بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};
