import { platformAuthService, platformAuthStorage } from "@/services/platform-auth.service";
import { PlatformLoginResponse, PlatformLoginDto } from "@/types/platform-auth.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";


// ─── Keys ─────────────────────────────────────────────────────────────────────

export const platformAuthKeys = {
  user: ["platform", "auth", "user"] as const,
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export function usePlatformLogin(
  onSuccess?: (data: PlatformLoginResponse) => void,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: PlatformLoginDto) => platformAuthService.login(dto),
    onSuccess: (data) => {
      qc.setQueryData(platformAuthKeys.user, data.user);
      onSuccess?.(data);
    },
  });
}

export function usePlatformLogout(onLogout?: () => void) {
  const qc = useQueryClient();

  return () => {
    platformAuthService.logout();
    qc.clear();
    onLogout?.();
  };
}

// ─── State helpers (no network) ───────────────────────────────────────────────

export function usePlatformUser() {
  return platformAuthStorage.getUser();
}

export function usePlatformRole() {
  return platformAuthStorage.getRole();
}

