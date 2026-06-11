import { UserRole } from "./common.types";

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
  organizationId?: number | null;
  organization?: {
    id: number;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    type: string;
    typeAr?: string | null;
    typeEn?: string | null;
    slug?: string;
    logo?: string | null;
    isActive?: boolean;
    hasActiveSubscription?: boolean;
    subscriptions?: Array<{
      id: number;
      status: string;
      endDate: string;
    }>;
  } | null;
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
