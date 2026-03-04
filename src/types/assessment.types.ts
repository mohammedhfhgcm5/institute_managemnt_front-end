import { AssessmentType } from './common.types';

export interface AssessmentStudentSummary {
  id: number;
  firstName: string;
  lastName: string;
}

export interface AssessmentGradeSubjectSummary {
  id: number;
  grade?: { id: number; name: string };
  subject?: { id: number; name: string };
}

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
  student?: AssessmentStudentSummary;
  gradeSubject?: AssessmentGradeSubjectSummary;
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

export interface BulkAssessmentStudentData {
  studentId: number;
  score?: number;
  feedback?: string;
}

export interface BulkCreateAssessmentData {
  gradeSubjectId: number;
  type: AssessmentType;
  title: string;
  maxScore: number;
  assessmentDate: string;
  students: BulkAssessmentStudentData[];
}

export interface BulkCreateAssessmentResult {
  successCount: number;
  failureCount: number;
  created: Assessment[];
  errors: { studentId: number; message: string }[];
}
