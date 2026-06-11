import type {
  PlatformLoginDto,
  PlatformLoginResponse,
  PlatformRole,
  PlatformUser,
} from "@/types/platform-auth.types";
import { PLATFORM_API_URL } from "./platform-api.config";

const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "platformRefreshToken",
  user: "platformUser",
} as const;

interface PlatformLoginEnvelope {
  success: boolean;
  data: Omit<PlatformLoginResponse, "user"> & {
    user: Omit<PlatformUser, "role"> & {
      role: PlatformRole | "superadmin";
    };
  };
  message?: string;
  timestamp?: string;
}

function apiError(payload: unknown, fallback: string): Error {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return new Error(payload.message);
  }
  return new Error(fallback);
}

function normalizeLoginResponse(
  payload: PlatformLoginEnvelope,
): PlatformLoginResponse {
  if (!payload.success || !payload.data?.accessToken || !payload.data?.user) {
    throw new Error(payload.message || "تعذر تسجيل الدخول. الاستجابة غير صالحة.");
  }

  return {
    ...payload.data,
    user: {
      ...payload.data.user,
      role:
        payload.data.user.role === "superadmin"
          ? "super_admin"
          : payload.data.user.role,
    },
  };
}

export const platformAuthStorage = {
  save(response: PlatformLoginResponse) {
    localStorage.setItem(STORAGE_KEYS.accessToken, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, response.refreshToken);
    }
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));
  },

  clear() {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },

  getUser(): PlatformUser | null {
    const value = localStorage.getItem(STORAGE_KEYS.user);
    if (!value) return null;
    try {
      return JSON.parse(value) as PlatformUser;
    } catch {
      this.clear();
      return null;
    }
  },

  getRole(): PlatformRole | null {
    return this.getUser()?.role ?? null;
  },
};

export const platformAuthService = {
  async login(dto: PlatformLoginDto): Promise<PlatformLoginResponse> {
    const response = await fetch(`${PLATFORM_API_URL}/platform/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      throw apiError(payload, "تعذر تسجيل الدخول. تحقق من البيانات.");
    }

    const payload = (await response.json()) as PlatformLoginEnvelope;
    const data = normalizeLoginResponse(payload);
    platformAuthStorage.save(data);
    return data;
  },

  logout() {
    platformAuthStorage.clear();
  },

  isAuthenticated(): boolean {
    return Boolean(platformAuthStorage.getAccessToken());
  },

  hasRole(...roles: PlatformRole[]): boolean {
    const role = platformAuthStorage.getRole();
    return role !== null && roles.includes(role);
  },
};
