import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { platformAuthService } from "@/services/platform-auth.service";

export function PlatformGuard({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!platformAuthService.isAuthenticated()) {
    return (
      <Navigate
        to="/platform/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
