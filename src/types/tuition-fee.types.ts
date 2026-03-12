import { Grade } from './grade.types';

export interface TuitionFee {
  id: number;
  gradeId: number;
  academicYear: string;
  annualAmount: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  grade?: Pick<Grade, 'id' | 'name'>;
}

export interface CreateTuitionFeeData {
  gradeId: number;
  academicYear: string;
  annualAmount: number;
  description?: string;
}

export interface UpdateTuitionFeeData extends Partial<CreateTuitionFeeData> {}

export interface StudentBalanceSummary {
  academicYear: string;
  annualAmount: number;
  totalPaid: number;
  remaining: number;
}