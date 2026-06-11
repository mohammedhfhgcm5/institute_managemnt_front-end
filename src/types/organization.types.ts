import type { SubscriptionStatus } from "./subscription.types";

export interface Subscription {
  id: number;
  organizationId: number;
  plan: string;
  price: number | string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: number;
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  type: string;
  typeAr?: string | null;
  typeEn?: string | null;
  slug: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  logo?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  subscriptions?: Subscription[];
  _count?: {
    users: number;
    students: number;
    teachers: number;
  };
}

export interface CreateOrganizationDto {
  nameAr: string;
  nameEn: string;
  type: "school" | "institute";
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  adminPassword: string;
}

export interface UpdateOrganizationDto extends Partial<
  Omit<CreateOrganizationDto, "adminPassword">
> {
  isActive?: boolean;
}

export interface OrganizationCredentials {
  email: string;
  password: string;
}

export interface CreateOrganizationResult {
  organization: Organization;
  credentials: OrganizationCredentials;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
