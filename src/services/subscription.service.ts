import { platformAuthStorage } from "./platform-auth.service";
import { PLATFORM_API_URL } from "./platform-api.config";
import type {
  CreateSubscriptionDto,
  ExtendSubscriptionDto,
  PaginatedResult,
  PaginationParams,
  Subscription,
  UpdateSubscriptionStatusDto,
  UpdateSubscriptionDto,
} from "@/types/subscription.types";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = platformAuthStorage.getAccessToken();
  const response = await fetch(`${PLATFORM_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message || `فشل الطلب (${response.status})`);
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json();
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "success" in payload
  ) {
    return payload.data as T;
  }

  return payload as T;
}

function queryString(params: PaginationParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  const value = query.toString();
  return value ? `?${value}` : "";
}

export const subscriptionsService = {
  create: (dto: CreateSubscriptionDto) =>
    request<Subscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  findAll: (params: PaginationParams = {}) =>
    request<PaginatedResult<Subscription>>(
      `/subscriptions${queryString(params)}`,
    ),
  findOne: (id: number) => request<Subscription>(`/subscriptions/${id}`),
  update: (id: number, dto: UpdateSubscriptionDto) =>
    request<Subscription>(`/subscriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
  updateStatus: (id: number, dto: UpdateSubscriptionStatusDto) =>
    request<Subscription>(`/subscriptions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
  extend: (id: number, dto: ExtendSubscriptionDto) =>
    request<Subscription>(`/subscriptions/${id}/extend`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
  pause: (id: number) =>
    request<Subscription>(`/subscriptions/${id}/pause`, { method: "PATCH" }),
  remove: (id: number) =>
    request<{ message?: string }>(`/subscriptions/${id}`, {
      method: "DELETE",
    }),
};
