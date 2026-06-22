// providers/auth-provider.tsx
"use client";

import { createContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { logoutAction } from "@/actions/auth-actions";
import { getUserFromUserCookie, isAuthenticated } from "@/lib/jwt";
import {
  ACCESS_TOKEN_LIFETIME_MS,
  REFRESH_BEFORE_EXPIRY_MS,
  TOKEN_CHECK_INTERVAL_MS,
} from "@/lib/constants/auth";
import { UserSessionPayload } from "@mini-erp/shared";
import { Spinner } from "@/components/ui/spinner";
import { refreshTokenAction } from "@/actions/token-actions";

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  user: UserSessionPayload | null;
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inizia sempre null (SSR e primo render client sono allineati)
  const [user, setUser] = useState<UserSessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  // Initial Auth Check — post-hydration
  // ========================================
  useEffect(() => {
    // Questo gira solo client-side, dopo l'hydration
    // SSR e primo render client sono entrambi null → nessun mismatch
    try {
      const userData = getUserFromUserCookie();
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================
  // Proactive Token Refresh
  // ========================================
  useEffect(() => {
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
      const timeUntilExpiry = ACCESS_TOKEN_LIFETIME_MS - tokenAge;

      // Usa costante per soglia refresh
      if (timeUntilExpiry <= REFRESH_BEFORE_EXPIRY_MS && timeUntilExpiry > 0) {
        console.log("🔄 Proactive token refresh triggered...");
        isRefreshingRef.current = true;

        try {
          const result = await refreshTokenAction();

          if (result.success) {
            console.log("✅ Token refreshed successfully");
            refreshUser();
          } else {
            console.error("❌ Token refresh failed");
            if (result.forceLogout) {
              // Cookie già puliti dal server action, forza redirect al login
              window.location.href = "/login";
            }
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
    refreshTimerRef.current = setInterval(checkAndRefreshToken, TOKEN_CHECK_INTERVAL_MS);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [user, logout, refreshUser]);

  /*
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
    */

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
