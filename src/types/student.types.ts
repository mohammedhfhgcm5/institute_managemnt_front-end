import { Gender, StudentStatus } from './common.types';

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
