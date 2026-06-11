import { PLATFORM_API_URL } from "@/services/platform-api.config";

export function resolveAssetUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${PLATFORM_API_URL}/${value.replace(/^\/+/, "")}`;
}
