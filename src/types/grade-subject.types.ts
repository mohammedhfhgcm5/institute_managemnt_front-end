import { Grade } from "./grade.types";
import { Subject } from "./subject.types";
import { Teacher } from "./teacher.types";

export interface GradeSubject {
  id: number;
  gradeId: number;
  subjectId: number;
  teacherId?: number;
  createdAt: string;
  updatedAt: string;
  grade:Grade,
  subject:Subject,
  teacher:Teacher
}

export interface CreateGradeSubjectData {
  gradeId: number;
  subjectId: number;
  teacherId?: number;
}

export interface UpdateGradeSubjectData extends Partial<CreateGradeSubjectData> {}
