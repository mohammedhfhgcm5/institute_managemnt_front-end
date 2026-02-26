import { DayOfWeek, ScheduleStatus } from './common.types';

export interface Schedule {
  id: number;
  sectionId: number;
  gradeSubjectId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleData {
  sectionId: number;
  gradeSubjectId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  status?: ScheduleStatus;
}

export interface UpdateScheduleData extends Partial<CreateScheduleData> {}
