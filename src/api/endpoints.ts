export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },

   USERS :
   {
      USERS: '/users',
      USER_BY_ID: (id: number) => `/users/${id}`,
   },


  STUDENTS: '/students',
  STUDENT_BY_ID: (id: number) => `/students/${id}`,
  STUDENTS_BY_SECTION: (sectionId: number) => `/students/section/${sectionId}`,
  STUDENTS_BY_PARENT: (parentId: number) => `/students/parent/${parentId}`,

  ASSESSMENTS: '/assessments',
ASSESSMENT_BY_ID: (id: number) => `/assessments/${id}`,
ASSESSMENTS_BY_STUDENT: (studentId: number) => `/assessments/student/${studentId}`,

  TEACHERS: '/teachers',
  TEACHER_BY_ID: (id: number) => `/teachers/${id}`,

  PARENTS: '/parents',
  PARENT_BY_ID: (id: number) => `/parents/${id}`,

  SUBJECTS: '/subjects',
  SUBJECT_BY_ID: (id: number) => `/subjects/${id}`,

  ATTENDANCE: '/attendance',
  ATTENDANCE_BY_ID: (id: number) => `/attendance/${id}`,
  ATTENDANCE_BULK: '/attendance/bulk',
  ATTENDANCE_STATS: (studentId: number) => `/attendance/stats/${studentId}`,

  GRADES: '/grades',
  GRADE_BY_ID: (id: number) => `/grades/${id}`,

  SECTIONS: '/sections',
  SECTION_BY_ID: (id: number) => `/sections/${id}`,
  SECTIONS_BY_GRADE: (gradeId: number) => `/sections/grade/${gradeId}`,

  GRADE_SUBJECTS: '/grade-subjects',
  GRADE_SUBJECT_BY_ID: (id: number) => `/grade-subjects/${id}`,
  GRADE_SUBJECTS_BY_GRADE: (gradeId: number) => `/grade-subjects/grade/${gradeId}`,
  GRADE_SUBJECTS_BY_TEACHER: (teacherId: number) => `/grade-subjects/teacher/${teacherId}`,

  PAYMENTS: '/payments',
  PAYMENT_BY_ID: (id: number) => `/payments/${id}`,
  PAYMENT_STATS: '/payments/stats',
  PAYMENTS_BY_STUDENT: (studentId: number) => `/payments/student/${studentId}`,

  EXPENSES: '/expenses',
  EXPENSE_BY_ID: (id: number) => `/expenses/${id}`,
  EXPENSE_STATS: '/expenses/stats',

  NOTIFICATIONS: '/notifications',
  MY_NOTIFICATIONS: '/notifications/my',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_AS_READ: (id: number) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  BULK_NOTIFICATION: '/notifications/bulk',

  REPORTS: '/reports',
  REPORT_BY_ID: (id: number) => `/reports/${id}`,

  SCHEDULES: '/schedules',
  SCHEDULE_BY_ID: (id: number) => `/schedules/${id}`,
  SCHEDULES_BY_SECTION: (sectionId: number) => `/schedules/section/${sectionId}`,
  SCHEDULES_BY_TEACHER: (teacherId: number) => `/schedules/teacher/${teacherId}`,

  DASHBOARD: {
    STATS: '/dashboard/stats',
    ATTENDANCE_CHART: '/dashboard/attendance-chart',
    FINANCIAL_CHART: '/dashboard/financial-chart',
    RECENT_ACTIVITIES: '/dashboard/recent-activities',
  },
} as const;
