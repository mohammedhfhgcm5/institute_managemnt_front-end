import { platformAuthStorage } from "./platform-auth.service";
import { PLATFORM_API_URL } from "./platform-api.config";
import type {
  CreateOrganizationDto,
  CreateOrganizationResult,
  Organization,
  PaginatedResult,
  PaginationParams,
  UpdateOrganizationDto,
} from "@/types/organization.types";

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

export const organizationsService = {
  create: (dto: CreateOrganizationDto) =>
    request<CreateOrganizationResult>("/organizations", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  findAll: (params: PaginationParams = {}) =>
    request<PaginatedResult<Organization>>(
      `/organizations${queryString(params)}`,
    ),
  findOne: (id: number) => request<Organization>(`/organizations/${id}`),
  update: (id: number, dto: UpdateOrganizationDto) =>
    request<Organization>(`/organizations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
  uploadLogo: async (id: number, logo: File) => {
    const token = platformAuthStorage.getAccessToken();
    const formData = new FormData();
    formData.append("logo", logo);

    const response = await fetch(
      `${PLATFORM_API_URL}/organizations/${id}/logo`,
      {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      },
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        payload?.message || `فشل رفع الشعار (${response.status})`,
      );
    }

    return (payload?.data ?? payload) as Organization;
  },
  resetAdminPassword: (id: number, newPassword: string) =>
    request<{ message: string; email: string }>(
      `/organizations/${id}/admin-password`,
      {
        method: "PATCH",
        body: JSON.stringify({ newPassword }),
      },
    ),
  remove: (id: number) =>
    request<{ message?: string }>(`/organizations/${id}`, {
      method: "DELETE",
    }),
};
