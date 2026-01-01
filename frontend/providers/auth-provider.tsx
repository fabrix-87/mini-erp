// providers/auth-provider.tsx
"use client";

import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "../components/ui/spinner";
import { User } from "../types/api";
import { logoutAction } from "@/actions/auth";
import { getUserFromUserCookie, isAuthenticated } from "@/lib/jwt";

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
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  // ========================================
  // Initial Auth Check
  // ========================================
  useEffect(() => {
    const checkAuth = () => {
      const publicRoutes = ["/login", "/register", "/forgot-password"];

      if (publicRoutes.includes(pathname)) {
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
          throw new Error('Not authenticated');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);

        if (!publicRoutes.includes(pathname)) {
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
