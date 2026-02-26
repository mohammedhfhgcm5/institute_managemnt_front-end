import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
import { CreateScheduleData, UpdateScheduleData } from '@/types/schedule.types';
import { toast } from 'sonner';

export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: number) => [...scheduleKeys.details(), id] as const,
  bySection: (sectionId: number) => [...scheduleKeys.all, 'section', sectionId] as const,
  byTeacher: (teacherId: number) => [...scheduleKeys.all, 'teacher', teacherId] as const,
};

export const useSchedules = () =>
  useQuery({
    queryKey: scheduleKeys.lists(),
    queryFn: () => scheduleService.getAll(),
  });

export const useSchedule = (id: number) =>
  useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => scheduleService.getById(id),
    enabled: !!id,
  });

export const useSchedulesBySection = (sectionId: number) =>
  useQuery({
    queryKey: scheduleKeys.bySection(sectionId),
    queryFn: () => scheduleService.getBySection(sectionId),
    enabled: !!sectionId,
  });

export const useSchedulesByTeacher = (teacherId: number) =>
  useQuery({
    queryKey: scheduleKeys.byTeacher(teacherId),
    queryFn: () => scheduleService.getByTeacher(teacherId),
    enabled: !!teacherId,
  });

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScheduleData) => scheduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('تم إضافة الحصة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateScheduleData }) =>
      scheduleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(variables.id) });
      toast.success('تم تحديث الحصة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => scheduleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('تم حذف الحصة بنجاح');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    },
  });
};
