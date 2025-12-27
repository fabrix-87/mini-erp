// services/auth.ts
import api from "../lib/client/api";
import {
  addFingerprintHeader,
  resetFingerprint,
} from "@/lib/client/fingerprint";
import type {
  LoginCredentials,
  RegisterData,
  ApiResponse,
  User,
} from "@/types/api";

// ============================================================================
// Auth API Functions
// ============================================================================

/**
 * Login utente
 * Aggiunge fingerprint automaticamente e chiama Next.js route
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  const headers = await addFingerprintHeader({"Content-Type": "application/json"})
  // Chiama Next.js API route che gestisce fingerprint
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers,
    body: JSON.stringify(credentials),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const data: ApiResponse<{ user: User }> = await response.json();
  return data.data.user;
}

/**
 * Register nuovo utente
 */
export async function register(userData: RegisterData): Promise<User> {
  // Aggiungi fingerprint per registrazione
  const headers = await addFingerprintHeader({
    "Content-Type": "application/json",
  });

  const response = await api.post<ApiResponse<User>>(
    "/users/register",
    userData,
    {
      headers,
    }
  );

  return response.data.data;
}

/**
 * Logout utente
 * Usa Next.js route per cleanup cookies e chiamata backend
 */
export async function logout(): Promise<void> {
  const headers = await addFingerprintHeader();

  await fetch("/api/auth/logout", {
    method: "POST",
    headers,
    credentials: "include",
  });

  resetFingerprint();
}

/**
 * Refresh token manuale
 * (Normalmente gestito automaticamente dall'interceptor)
 */
export async function refreshToken(): Promise<boolean> {
  const headers = await addFingerprintHeader();
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    console.error("❌ Token refresh failed:", response);
    throw new Error("Token refresh failed");
  }
  console.log("✅ Token refreshed successfully");
  return true;
}

/**
 * Forgot password
 */
export async function forgotPassword(email: string): Promise<void> {
  const response = await api.post<ApiResponse>("/users/forgot-password", {
    email,
  });
  return response.data.data;
}

/**
 * Reset password
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const response = await api.post<ApiResponse>("/users/reset-password", {
    token,
    newPassword,
  });
  return response.data.data;
}

/**
 * Verify email
 */
export async function verifyEmail(token: string): Promise<void> {
  const response = await api.get<ApiResponse>(`/users/verify-email/${token}`);
  return response.data.data;
}
