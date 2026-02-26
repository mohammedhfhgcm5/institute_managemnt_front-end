import { AttendanceStatus } from './common.types';

export interface Attendance {
  id: number;
  studentId: number;
  scheduleId: number;
  date: string;
  status: AttendanceStatus;
  lateMinutes?: number;
  notes?: string;
  parentNotified: boolean;
  notificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceData {
  studentId: number;
  scheduleId: number;
  date: string;
  status: AttendanceStatus;
  lateMinutes?: number;
  notes?: string;
}

export interface UpdateAttendanceData extends Partial<CreateAttendanceData> {}

export interface BulkAttendanceItemData {
  studentId: number;
  status: AttendanceStatus;
  lateMinutes?: number;
  notes?: string;
}

export interface BulkAttendanceData {
  scheduleId: number;
  date: string;
  students: BulkAttendanceItemData[];
}

export interface AttendanceFilterParams {
  studentId?: number;
  scheduleId?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: AttendanceStatus;
}

export interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  attendanceRate: number;
}
