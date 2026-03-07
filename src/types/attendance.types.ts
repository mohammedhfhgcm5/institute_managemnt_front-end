import { AttendanceStatus } from './common.types';

export interface AttendanceStudentSummary {
  id: number;
  firstName: string;
  lastName: string;
}

export interface AttendanceScheduleSummary {
  id: number;
  sectionId?: number;
  gradeSubjectId?: number;
  section?: {
    id: number;
    name: string;
  };
  gradeSubject?: {
    id: number;
    subject?: {
      id: number;
      name: string;
    };
  };
}

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
  student?: AttendanceStudentSummary;
  schedule?: AttendanceScheduleSummary;
}

export interface CreateAttendanceData {
  studentId: number;
  date: string;
  status: AttendanceStatus;
  lateMinutes?: number;
  notes?: string;
}

export interface UpdateAttendanceData extends Partial<CreateAttendanceData> {}

export interface ExceptionStudentData {
  studentId: number;
  status: AttendanceStatus;
  lateMinutes?: number;
  notes?: string;
}

export interface SmartBulkAttendanceData {
  sectionId: number;
  date: string;
  exceptions?: ExceptionStudentData[];
}

export interface BulkAttendanceResult {
  message: string;
  data: Attendance[];
}

export type BulkAttendanceItemData = ExceptionStudentData;
export type BulkAttendanceData = SmartBulkAttendanceData;

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
