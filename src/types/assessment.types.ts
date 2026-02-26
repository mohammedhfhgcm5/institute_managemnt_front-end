import { AssessmentType } from './common.types';

export interface Assessment {
  id: number;
  studentId: number;
  gradeSubjectId: number;
  type: AssessmentType;
  title: string;
  maxScore: number;
  score?: number;
  percentage?: number;
  grade?: string;
  feedback?: string;
  assessmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentData {
  studentId: number;
  gradeSubjectId: number;
  type: AssessmentType;
  title: string;
  maxScore: number;
  score?: number;
  feedback?: string;
  assessmentDate: string;
}

export interface UpdateAssessmentData extends Partial<CreateAssessmentData> {}
