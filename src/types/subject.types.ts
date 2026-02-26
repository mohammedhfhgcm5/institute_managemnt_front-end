export interface Subject {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectData {
  name: string;
  description?: string;
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {}
