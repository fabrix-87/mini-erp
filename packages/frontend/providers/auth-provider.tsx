// providers/auth-provider.tsx
"use client";

import { createContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { logoutAction } from "@/actions/auth-actions";
import { getUserFromUserCookie } from "@/lib/jwt";
import {
  ACCESS_TOKEN_LIFETIME_MS,
  REFRESH_BEFORE_EXPIRY_MS,
  TOKEN_CHECK_INTERVAL_MS,
} from "@/lib/constants/auth";
import { UserSessionPayload } from "@mini-erp/shared";
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
// Helpers
// ============================================================================

/**
 * Reads the tokenTimestamp cookie value from the browser.
 * Returns null if not found or running server-side.
 */
function getTokenTimestamp(): number | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith("tokenTimestamp="))
    ?.split("=")[1];
  return raw ? Number(raw) : null;
}

/**
 * Returns true if the token was issued less than `thresholdMs` ago.
 * Used to skip the refresh check immediately after login.
 */
function isTokenFresh(thresholdMs = 30_000): boolean {
  const timestamp = getTokenTimestamp();
  if (!timestamp) return false;
  return Date.now() - timestamp < thresholdMs;
}

// ============================================================================
// Context
// ============================================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTimerRef = useRef<NodeJS.Timeout>(null);
  const isRefreshingRef = useRef(false);

  // ========================================
  // Refresh User from cookie
  // ========================================

  /** Re-reads the user cookie and updates the context state. */
  const refreshUser = useCallback(() => {
    setUser(getUserFromUserCookie());
  }, []);

  // ========================================
  // Logout
  // ========================================

  /** Clears server-side cookies, resets state and stops the refresh timer. */
  const logout = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    setUser(null);
    try {
      await logoutAction(); // handles cookie cleanup + redirect
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  // ========================================
  // Initial Auth Check — post-hydration only
  // ========================================

  useEffect(() => {
    try {
      setUser(getUserFromUserCookie());
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
    if (!user) return;

    const checkAndRefreshToken = async () => {
      // Prevent concurrent refresh calls
      if (isRefreshingRef.current) return;

      // Skip if token was just issued (e.g. immediately after login)
      if (isTokenFresh()) return;

      const tokenTimestamp = getTokenTimestamp();
      if (!tokenTimestamp) {
        console.warn("⚠️ No token timestamp found, skipping refresh check");
        return;
      }

      const tokenAge = Date.now() - tokenTimestamp;
      const timeUntilExpiry = ACCESS_TOKEN_LIFETIME_MS - tokenAge;

      // Token expired too long ago — force logout
      if (timeUntilExpiry < -60_000) {
        console.error("❌ Token expired, logging out...");
        await logout();
        return;
      }

      // Proactive refresh window
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
            if (result.forceLogout) await logout();
          }
        } catch (error) {
          console.error("❌ Token refresh error:", error);
        } finally {
          isRefreshingRef.current = false;
        }
      }
    };

    checkAndRefreshToken();
    refreshTimerRef.current = setInterval(checkAndRefreshToken, TOKEN_CHECK_INTERVAL_MS);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [user, logout, refreshUser]);

  // ========================================
  // Context Value
  // ========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        refreshUser,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
