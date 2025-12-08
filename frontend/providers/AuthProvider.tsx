"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { logout as apiLogout } from "../lib/api/modules/auth";
import { Spinner } from "../components/ui/spinner";
import { toast } from "sonner";
import { User } from "../types/api";
import { getUser } from "@/lib/api/modules/user";
import api from "@/lib/api/client";

interface AuthContextType {
  user: User | null;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  
  const didMountRef = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ⭐ Funzione per ottenere le info del token dal server
  const getTokenInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/token-info', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Errore nel recuperare token info:", error);
      return null;
    }
  }, []);

  // ⭐ Funzione per schedulare il refresh del token
  const scheduleTokenRefresh = useCallback(async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    const tokenInfo = await getTokenInfo();
    
    if (!tokenInfo || !tokenInfo.exp) {
      console.log("⚠️ Nessun token trovato, skip refresh");
      return;
    }

    const expiresAt = tokenInfo.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Se il token è già scaduto o scade tra meno di 30 secondi
    if (timeUntilExpiry <= 30000) {
      console.log("⚠️ Token scaduto o in scadenza, tentativo refresh immediato");
      try {
        await api.post("/users/refresh-token");
        console.log("✅ Token refreshed con successo");
        await refreshUser();
        scheduleTokenRefresh(); // Re-schedula
      } catch (error) {
        console.error("❌ Token refresh fallito:", error);
        await logout();
      }
      return;
    }

    // Refresh 2 minuti prima della scadenza
    const refreshTime = Math.max(0, timeUntilExpiry - (2 * 60 * 1000));

    console.log(`⏰ Token scade tra ${Math.round(timeUntilExpiry / 1000)}s`);
    console.log(`🔄 Refresh schedulato tra ${Math.round(refreshTime / 1000)}s`);

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("🔄 Esecuzione refresh token...");
        await api.post("/users/refresh-token");
        console.log("✅ Token refreshed con successo");
        
        await refreshUser();
        scheduleTokenRefresh(); // Re-schedula dopo il refresh
      } catch (error) {
        console.error("❌ Token refresh fallito:", error);
        
        toast.error("Sessione scaduta", {
          description: "Per favore effettua di nuovo il login",
        });
        
        await logout();
      }
    }, refreshTime);
  }, [getTokenInfo]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    try {
      await apiLogout();
      setUser(null);
      toast.success("Logout eseguito");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      window.location.href = "/login";
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && didMountRef.current) {
      return;
    } else {
      didMountRef.current = true;
    }

    const checkAuth = async () => {
      const publicRoutes = ["/login"];
      if (publicRoutes.includes(pathname)) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      setIsLoading(true);
      try {
        const userData = await getUser();
        setUser(userData);
        
        // ⭐ Avvia il refresh automatico
        scheduleTokenRefresh();
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [pathname, scheduleTokenRefresh]);

  useEffect(() => {
    if (user && pathname !== "/login") {
      scheduleTokenRefresh();
    }
  }, [user, pathname, scheduleTokenRefresh]);

  if (isLoading && pathname !== "/login") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
