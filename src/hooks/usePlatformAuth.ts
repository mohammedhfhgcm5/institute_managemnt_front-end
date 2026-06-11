import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  platformAuthService,
  platformAuthStorage,
} from "@/services/platform-auth.service";
import type {
  PlatformLoginDto,
  PlatformLoginResponse,
} from "@/types/platform-auth.types";

export const platformAuthKeys = {
  user: ["platform", "auth", "user"] as const,
};

export function usePlatformLogin(
  onSuccess?: (data: PlatformLoginResponse) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PlatformLoginDto) => platformAuthService.login(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(platformAuthKeys.user, data.user);
      onSuccess?.(data);
    },
  });
}

export function usePlatformLogout(onLogout?: () => void) {
  const queryClient = useQueryClient();
  return () => {
    platformAuthService.logout();
    queryClient.removeQueries({ queryKey: ["platform"] });
    queryClient.removeQueries({ queryKey: ["organizations"] });
    queryClient.removeQueries({ queryKey: ["subscriptions"] });
    onLogout?.();
  };
}

export function usePlatformUser() {
  return platformAuthStorage.getUser();
}

export function usePlatformRole() {
  return platformAuthStorage.getRole();
}
