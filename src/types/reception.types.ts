export interface Reception {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReceptionData {
  userId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface UpdateReceptionData extends Partial<CreateReceptionData> {}
