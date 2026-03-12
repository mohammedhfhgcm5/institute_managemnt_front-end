import { Attendance } from './attendance.types';
import { Assessment } from './assessment.types';
import { Gender, StudentStatus } from './common.types';
import { Parent } from './parent.types';
import { Payment } from './payment.types';
import { Section } from './section.types';
import { Grade } from './grade.types';

export interface Student {
  id: number;
  userId?: number;
  parentId?: number;
  sectionId?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  academicYear?: string;
  registrationDate: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  parent?: Parent;
  section?: Section & { grade?: Grade };
  user?: { id: number; email: string };
  attendances?: Attendance[];
  assessments?: Assessment[];
  payments?: Payment[];
}

export interface CreateStudentData {
  userId?: number;
  parentId?: number;
  sectionId?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  academicYear?: string;
  status?: StudentStatus;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {}
