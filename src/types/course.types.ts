export interface Course {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  name: string;
  description?: string;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {}
