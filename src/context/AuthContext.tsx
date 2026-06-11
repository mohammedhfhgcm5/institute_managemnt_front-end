import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { AuthUser } from "@/types/auth.types";
import { authService } from "@/services/auth.service";
import { resolveAssetUrl } from "@/utils/assets";

function normalizeUser(user: AuthUser): AuthUser {
  if (!user.organization) return user;
  return {
    ...user,
    organization: {
      ...user.organization,
      logo: resolveAssetUrl(user.organization.logo),
    },
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    if (storedUser && token) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
    }

    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getProfile()
      .then((profile) => {
        const normalizedProfile = normalizeUser(profile);
        localStorage.setItem("user", JSON.stringify(normalizedProfile));
        setUser(normalizedProfile);
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login", { replace: true });
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const login = useCallback(
    (token: string, userData: AuthUser) => {
      const normalizedUser = normalizeUser(userData);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      navigate("/");
    },
    [navigate],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
