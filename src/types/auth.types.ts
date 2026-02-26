import { UserRole } from './common.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export interface AuthUser {
  id: number;
  email: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateFcmTokenData {
  fcmToken: string;
}
