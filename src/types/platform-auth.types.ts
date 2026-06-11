export type PlatformRole = "super_admin" | "admin" | "support";

export interface PlatformUser {
  id: number;
  email: string;
  role: PlatformRole;
  isActive?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformLoginDto {
  email: string;
  password: string;
}

export interface PlatformLoginResponse {
  user: PlatformUser;
  accessToken: string;
  refreshToken?: string;
}
