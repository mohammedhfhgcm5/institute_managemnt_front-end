import { SectionStatus } from './common.types';

export interface Section {
  id: number;
  gradeId: number;
  name: string;
  academicYear: string;
  maxStudents?: number;
  status: SectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionData {
  gradeId: number;
  name: string;
  academicYear: string;
  maxStudents?: number;
  status?: SectionStatus;
}

export interface UpdateSectionData extends Partial<CreateSectionData> {}
