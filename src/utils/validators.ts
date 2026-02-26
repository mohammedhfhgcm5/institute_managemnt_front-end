import { z } from 'zod';

export const emailSchema = z.string().email('البريد الإلكتروني غير صالح');

export const phoneSchema = z
  .string()
  .regex(/^[+]?[0-9]{10,15}$/, 'رقم الهاتف غير صالح')
  .optional()
  .or(z.literal(''));

export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} مطلوب`);

export const optionalString = z.string().optional().or(z.literal(''));

export const positiveNumber = (fieldName: string) =>
  z.number().min(0, `${fieldName} يجب أن يكون رقم موجب`);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const studentSchema = z.object({
  firstName: requiredString('First name'),
  lastName: requiredString('Last name'),
  dateOfBirth: requiredString('Date of birth'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  parentId: z.number().optional(),
  sectionId: z.number().optional(),
  academicYear: optionalString,
  address: optionalString,
  status: z.enum(['active', 'inactive', 'graduated']).optional(),
});

export const teacherSchema = z.object({
  firstName: requiredString('الاسم الأول'),
  lastName: requiredString('اسم العائلة'),
  specialization: requiredString('التخصص'),
  qualifications: requiredString('المؤهلات'),
  experienceYears: z.number().min(0, 'سنوات الخبرة مطلوبة'),
  bio: optionalString,
  salary: positiveNumber('الراتب'),
  hireDate: requiredString('تاريخ التعيين'),
});

export const parentSchema = z.object({
  firstName: requiredString('الاسم الأول'),
  lastName: requiredString('اسم العائلة'),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  email: emailSchema.optional().or(z.literal('')),
  address: optionalString,
  relationship: z.enum(['father', 'mother', 'guardian'], {
    required_error: 'Relationship is required',
  }),
});

export const courseSchema = z.object({
  name: requiredString('اسم المادة'),
  description: optionalString,
  teacherId: z.number().min(1, 'المعلم مطلوب'),
  gradeLevel: requiredString('المرحلة الدراسية'),
  schedule: optionalString,
  maxStudents: z.number().min(1, 'الحد الأقصى للطلاب مطلوب'),
  startDate: requiredString('تاريخ البدء'),
  endDate: requiredString('تاريخ الانتهاء'),
});

export const attendanceSchema = z.object({
  studentId: z.number().min(1, 'الطالب مطلوب'),
  courseId: z.number().min(1, 'المادة مطلوبة'),
  date: requiredString('التاريخ'),
  status: z.enum(['present', 'absent', 'late', 'excused'], {
    required_error: 'Relationship is required',
  }),
  notes: optionalString,
});

export const gradeSchema = z.object({
  studentId: z.number().min(1, 'الطالب مطلوب'),
  courseId: z.number().min(1, 'المادة مطلوبة'),
  examType: z.enum(['quiz', 'midterm', 'final', 'assignment', 'project'], {
    required_error: 'Relationship is required',
  }),
  score: z.number().min(0, 'الدرجة مطلوبة'),
  maxScore: z.number().min(1, 'الدرجة الكبرى مطلوبة'),
  notes: optionalString,
  date: requiredString('التاريخ'),
});

export const paymentSchema = z.object({
  studentId: z.number().min(1, 'الطالب مطلوب'),
  academicYear: requiredString('السنة الدراسية'),
  amount: positiveNumber('المبلغ'),
  discount: z.number().min(0).optional(),
  status: z
    .enum(['pending', 'paid', 'partial'])
    .optional(),
  dueDate: requiredString('تاريخ الاستحقاق'),
  paymentDate: optionalString,
  notes: optionalString,
});

export const expenseSchema = z.object({
  title: requiredString('العنوان'),
  description: optionalString,
  amount: positiveNumber('المبلغ'),
  category: z.enum(['salary', 'maintenance', 'supplies', 'utilities', 'other'], {
    required_error: 'Relationship is required',
  }),
  date: requiredString('التاريخ'),
  receipt: optionalString,
});

export const notificationSchema = z.object({
  title: requiredString('العنوان'),
  message: requiredString('الرسالة'),
  type: z.enum(['info', 'warning', 'alert', 'success'], {
    required_error: 'Relationship is required',
  }),
  channel: z.enum(['in_app', 'email', 'sms'], {
    required_error: 'Relationship is required',
  }),
  recipientId: z.number().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z
      .string()
      .min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });
  



