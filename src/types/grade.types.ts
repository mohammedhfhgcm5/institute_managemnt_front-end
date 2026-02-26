import { GradeLevel } from './common.types';

export interface Grade {
  id: number;
  name: string;
  level: GradeLevel;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGradeData {
  name: string;
  level: GradeLevel;
  description?: string;
}

export interface UpdateGradeData extends Partial<CreateGradeData> {}
