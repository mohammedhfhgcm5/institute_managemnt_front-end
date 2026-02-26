export interface GradeSubject {
  id: number;
  gradeId: number;
  subjectId: number;
  teacherId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGradeSubjectData {
  gradeId: number;
  subjectId: number;
  teacherId?: number;
}

export interface UpdateGradeSubjectData extends Partial<CreateGradeSubjectData> {}
