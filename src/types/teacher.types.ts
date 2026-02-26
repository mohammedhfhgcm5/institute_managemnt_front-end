import { TeacherStatus } from './common.types';

export interface Teacher {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  specialization: string;
  qualifications?: string;
  experienceYears?: number;
  bio?: string;
  salary?: number;
  status: TeacherStatus;
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherData {
  userId?: number;
  firstName: string;
  lastName: string;
  specialization: string;
  qualifications?: string;
  experienceYears?: number;
  bio?: string;
  salary?: number;
  status?: TeacherStatus;
  hireDate?: string;
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {}
