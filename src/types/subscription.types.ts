export type SubscriptionStatus = "active" | "expired" | "paused";

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
  organization?: {
    id: number;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    slug?: string;
    email?: string;
    logo?: string | null;
  };
}

export interface CreateSubscriptionDto {
  organizationId: number;
  plan: string;
  price: number;
  startDate: string;
  endDate: string;
}

export type UpdateSubscriptionDto = Partial<CreateSubscriptionDto>;

export interface UpdateSubscriptionStatusDto {
  status: Extract<SubscriptionStatus, "active" | "paused">;
}

export interface ExtendSubscriptionDto {
  endDate: string;
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
