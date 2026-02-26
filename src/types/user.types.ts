import { UserRole } from './common.types';

export interface UserProfile {
  id: number;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  isActive?: boolean;
}
