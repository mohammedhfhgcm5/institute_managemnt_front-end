import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sectionService } from '@/services/section.service';
import { PaginationParams } from '@/types/common.types';
import { CreateSectionData, UpdateSectionData } from '@/types/section.types';
import { toast } from 'sonner';

export const sectionKeys = {
  all: ['sections'] as const,
  lists: () => [...sectionKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...sectionKeys.lists(), params] as const,
  details: () => [...sectionKeys.all, 'detail'] as const,
  detail: (id: number) => [...sectionKeys.details(), id] as const,
  byGrade: (gradeId: number) => [...sectionKeys.all, 'grade', gradeId] as const,
};

export const useSections = (params?: PaginationParams) =>
  useQuery({
    queryKey: sectionKeys.list(params),
    queryFn: () => sectionService.getAll(params),
  });

export const useSection = (id: number) =>
  useQuery({
    queryKey: sectionKeys.detail(id),
    queryFn: () => sectionService.getById(id),
    enabled: !!id,
  });

export const useSectionsByGrade = (gradeId: number) =>
  useQuery({
    queryKey: sectionKeys.byGrade(gradeId),
    queryFn: () => sectionService.getByGrade(gradeId),
    enabled: !!gradeId,
  });

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSectionData) => sectionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all });
      toast.success('تم إضافة الشعبة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSectionData }) =>
      sectionService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all });
      queryClient.invalidateQueries({ queryKey: sectionKeys.detail(variables.id) });
      toast.success('تم تحديث الشعبة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sectionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all });
      toast.success('تم حذف الشعبة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};
