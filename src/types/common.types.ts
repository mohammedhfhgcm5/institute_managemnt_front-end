export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export type UserRole = 'admin' | 'reception' | 'teacher' | 'student' | 'parent';

export type Relationship = 'father' | 'mother' | 'guardian';

export type TeacherStatus = 'active' | 'inactive';

export type GradeLevel = 'preparatory' | 'secondary';

export type SectionStatus = 'active' | 'inactive';

export type Gender = 'male' | 'female';

export type StudentStatus = 'active' | 'inactive' | 'graduated';

export type DayOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export type ScheduleStatus = 'scheduled' | 'cancelled' | 'completed';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type AssessmentType = 'quiz' | 'exam' | 'homework' | 'midterm' | 'final';

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export type ExpenseCategory =
  | 'salary'
  | 'maintenance'
  | 'supplies'
  | 'utilities'
  | 'other';

export type NotificationRelatedType =
  | 'attendance'
  | 'payment'
  | 'assessment'
  | 'general';

export type NotificationType = 'info' | 'warning' | 'alert' | 'success';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export type ReportType = 'attendance' | 'financial' | 'performance' | 'comparison';

export type ReportFormat = 'pdf' | 'excel' | 'json';

export interface SelectOption {
  label: string;
  value: string | number;
}
