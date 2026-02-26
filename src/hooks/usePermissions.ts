import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/common.types';

interface Permissions {
  canManageStudents: boolean;
  canManageTeachers: boolean;
  canManageParents: boolean;
  canManageCourses: boolean;
  canManageAttendance: boolean;
  canManageGrades: boolean;
  canManagePayments: boolean;
  canManageExpenses: boolean;
  canManageNotifications: boolean;
  canManageReports: boolean;
  canManageUsers: boolean;
  isAdmin: boolean;
}

const rolePermissions: Record<UserRole, Permissions> = {
  admin: {
    canManageStudents: true,
    canManageTeachers: true,
    canManageParents: true,
    canManageCourses: true,
    canManageAttendance: true,
    canManageGrades: true,
    canManagePayments: true,
    canManageExpenses: true,
    canManageNotifications: true,
    canManageReports: true,
    canManageUsers: true,
    isAdmin: true,
  },
  teacher: {
    canManageStudents: false,
    canManageTeachers: false,
    canManageParents: false,
    canManageCourses: false,
    canManageAttendance: true,
    canManageGrades: true,
    canManagePayments: false,
    canManageExpenses: false,
    canManageNotifications: false,
    canManageReports: true,
    canManageUsers: false,
    isAdmin: false,
  },
  reception: {
    canManageStudents: true,
    canManageTeachers: false,
    canManageParents: true,
    canManageCourses: false,
    canManageAttendance: true,
    canManageGrades: false,
    canManagePayments: true,
    canManageExpenses: false,
    canManageNotifications: true,
    canManageReports: true,
    canManageUsers: false,
    isAdmin: false,
  },
  student: {
    canManageStudents: false,
    canManageTeachers: false,
    canManageParents: false,
    canManageCourses: false,
    canManageAttendance: false,
    canManageGrades: false,
    canManagePayments: false,
    canManageExpenses: false,
    canManageNotifications: false,
    canManageReports: false,
    canManageUsers: false,
    isAdmin: false,
  },
  parent: {
    canManageStudents: false,
    canManageTeachers: false,
    canManageParents: false,
    canManageCourses: false,
    canManageAttendance: false,
    canManageGrades: false,
    canManagePayments: false,
    canManageExpenses: false,
    canManageNotifications: false,
    canManageReports: false,
    canManageUsers: false,
    isAdmin: false,
  },
};

export function usePermissions(): Permissions {
  const { user } = useAuth();
  if (!user) {
    return rolePermissions.student;
  }
  return rolePermissions[user.role] || rolePermissions.student;
}