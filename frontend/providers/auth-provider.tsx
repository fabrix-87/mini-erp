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
import { toast } from "sonner";
import { User } from "../types/api";
import api from "@/lib/client/api";

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ============================================================================
// Context
// ============================================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // ========================================
  // Fetch User Data
  // ========================================
  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/users/me');
      
      if (response.data.status === 'success') {
        setUser(response.data.data);
        return response.data.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      throw error;
    }
  }, []);

  // ========================================
  // Refresh User
  // ========================================
  const refreshUser = useCallback(async () => {
    try {
      await fetchUser();
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, [fetchUser]);

  // ========================================
  // Logout
  // ========================================
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Chiama logout route (Next.js API)
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      toast.success("Logout eseguito con successo");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ========================================
  // Initial Auth Check
  // ========================================
  useEffect(() => {
    const checkAuth = async () => {
      const publicRoutes = ["/login", "/register", "/forgot-password"];
      
      if (publicRoutes.includes(pathname)) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      setIsLoading(true);
      
      try {
        await fetchUser();
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        
        // Redirect to login only if not already on a public route
        if (!publicRoutes.includes(pathname)) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, fetchUser, router]);

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}