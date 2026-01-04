// providers/auth-provider.tsx
"use client";

import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "../components/ui/spinner";
import { User } from "../types/api";
import { logoutAction } from "@/actions/auth";
import { getUserFromUserCookie, isAuthenticated } from "@/lib/jwt";
import { refreshToken } from "@/services/client/auth";
import {
  ACCESS_TOKEN_LIFETIME_MS,
  REFRESH_BEFORE_EXPIRY_MS,
  TOKEN_CHECK_INTERVAL_MS,
} from "@/lib/constants/auth";
import { isPublicRoute } from "@/lib/constants/routes";

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  refreshUser: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ============================================================================
// Helper: Get Token Timestamp
// ============================================================================

function getTokenTimestamp(): number | null {
  if (typeof document === "undefined") return null;

  const timestamp = document.cookie
    .split("; ")
    .find((row) => row.startsWith("tokenTimestamp="))
    ?.split("=")[1];

  return timestamp ? Number(timestamp) : null;
}

// ============================================================================
// Context
// ============================================================================

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// ============================================================================
// Provider
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const refreshTimerRef = useRef<NodeJS.Timeout>(null);
  const isRefreshingRef = useRef(false);

  // ========================================
  // Refresh User
  // ========================================
  const refreshUser = useCallback(() => {
    const userData = getUserFromUserCookie();
    setUser(userData);
  }, []);

  // ========================================
  // Logout
  // ========================================
  const logout = useCallback(async () => {
    try {
      await logoutAction();
      setUser(null);

      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  // ========================================
  // Proactive Token Refresh
  // ========================================
  useEffect(() => {
    if (isPublicRoute(pathname)) {
      return;
    }

    if (!user) {
      return;
    }

    const checkAndRefreshToken = async () => {
      if (isRefreshingRef.current) {
        console.log("⏳ Refresh already in progress, skipping...");
        return;
      }

      const tokenTimestamp = getTokenTimestamp();

      if (!tokenTimestamp) {
        console.warn("⚠️ No token timestamp found");
        return;
      }

      const tokenAge = Date.now() - tokenTimestamp;
      const timeUntilExpiry = ACCESS_TOKEN_LIFETIME_MS - tokenAge; // ✅ Usa costante

      // Usa costante per soglia refresh
      if (timeUntilExpiry <= REFRESH_BEFORE_EXPIRY_MS && timeUntilExpiry > 0) {
        console.log("🔄 Proactive token refresh triggered...");
        isRefreshingRef.current = true;

        try {
          const success = await refreshToken();

          if (success) {
            console.log("✅ Token refreshed successfully");
            refreshUser();
          } else {
            console.error("❌ Token refresh failed");
          }
        } catch (error) {
          console.error("❌ Token refresh error:", error);
        } finally {
          isRefreshingRef.current = false;
        }
      }

      // Se scaduto da più di 1 minuto, logout
      if (timeUntilExpiry < -60000) {
        console.error("❌ Token expired too long ago, logging out...");
        await logout();
      }
    };

    checkAndRefreshToken();

    // Usa costante per intervallo
    refreshTimerRef.current = setInterval(
      checkAndRefreshToken,
      TOKEN_CHECK_INTERVAL_MS
    );

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [user, pathname, logout, refreshUser]);

  // ========================================
  // Initial Auth Check
  // ========================================
  useEffect(() => {
    const checkAuth = () => {
      if (isPublicRoute(pathname)) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      setIsLoading(true);

      try {
        const authenticated = isAuthenticated();

        if (authenticated) {
          const userData = getUserFromUserCookie();
          setUser(userData);
        } else {
          throw new Error("Not authenticated");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);

        if (!isPublicRoute(pathname)) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // ========================================
  // Loading State
  // ========================================
  if (isLoading && pathname !== "/login") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // ========================================
  // Context Value
  // ========================================
  const value: AuthContextType = {
    user,
    logout,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
