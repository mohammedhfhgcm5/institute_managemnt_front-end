import { Grade } from "./grade.types";
import { Subject } from "./subject.types";
import { Teacher } from "./teacher.types";
import { Section } from "./section.types";

export interface GradeSubject {
  id: number;
  gradeId: number;
  subjectId: number;
  teacherId: number;
  sectionId?: number | null;
  createdAt: string;
  updatedAt: string;
  grade?: Grade;
  subject?: Subject;
  teacher?: Teacher;
  section?: Section | null;
}

export interface CreateGradeSubjectData {
  gradeId: number;
  subjectId: number;
  teacherId: number;
  sectionId: number;
}

export interface UpdateGradeSubjectData extends Partial<CreateGradeSubjectData> {}
