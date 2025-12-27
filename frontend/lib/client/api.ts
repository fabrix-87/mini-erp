// lib/client/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { addFingerprintHeader } from "./fingerprint";
import { refreshToken } from "@/services/auth";

// ============================================================================
// Configuration
// ============================================================================

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// Refresh Token Logic
// ============================================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Processa la coda di richieste fallite dopo il refresh
 */
const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

// ============================================================================
// Request Interceptor
// ============================================================================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Aggiungi fingerprint ad ogni richiesta (solo client-side)
    if (typeof window !== 'undefined') {
      const headersWithFingerprint = await addFingerprintHeader(
        config.headers as Record<string, string>
      );
      Object.assign(config.headers, headersWithFingerprint);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // I cookie vengono inviati automaticamente con withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor - Auto Refresh on 401
// ============================================================================

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ========================================
    // Handle 401 Unauthorized - Auto Refresh
    // ========================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Evita login/logout pages
      if (typeof window !== "undefined") {
        const isAuthPage =
          window.location.pathname === "/login" ||
          window.location.pathname === "/logout";

        if (isAuthPage) {
          return Promise.reject(error);
        }
      }

      // Se già in refresh, accoda la richiesta
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 401 detected, attempting token refresh...");
        const refreshSuccess = await refreshToken();

        if (!refreshSuccess) {
          throw new Error("Refresh failed");
        }

        // Processa coda di richieste fallite
        processQueue();

        // Retry richiesta originale
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // Redirect to login
        if (typeof window !== "undefined") {
          toast.error("Sessione scaduta", {
            description: "Per favore effettua di nuovo il login",
          });
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ========================================
    // Handle Other Errors
    // ========================================
    const { status, data } = error.response || ({} as any);

    switch (status) {
      case 400:
        if (data?.errors && Array.isArray(data.errors)) {
          const errorsList = data.errors
            .map(
              (err: any) => `${err.field ? `${err.field}: ` : ""}${err.message}`
            )
            .join("\n");

          toast.error(data.message || "Errore di validazione", {
            description: errorsList,
            duration: 5000,
          });
        } else {
          toast.error(data?.message || "Richiesta non valida", {
            duration: 4000,
          });
        }
        break;

      case 403:
        toast.error("Accesso negato", {
          description: "Non hai i permessi per questa azione",
          duration: 4000,
        });
        break;

      case 404:
        toast.error("Risorsa non trovata", {
          duration: 3000,
        });
        break;

      case 422:
        if (data?.errors && Array.isArray(data.errors)) {
          const errorsList = data.errors
            .map(
              (err: any) => `${err.field ? `${err.field}: ` : ""}${err.message}`
            )
            .join("\n");

          toast.error(data.message || "Errore di validazione", {
            description: errorsList,
            duration: 5000,
          });
        } else {
          toast.error(data?.message || "Errore di validazione", {
            duration: 4000,
          });
        }
        break;

      case 409:
        toast.error("Conflitto", {
          description: data?.message || "Questa risorsa già esiste",
          duration: 4000,
        });
        break;

      case 500:
        toast.error("Errore interno del server", {
          description: "Per favore riprova più tardi",
          duration: 4000,
        });
        break;

      default:
        if (status !== 401) {
          toast.error(
            data?.message || error.message || "Si è verificato un errore"
          );
        }
    }

    return Promise.reject(error);
  }
);

export default api;
