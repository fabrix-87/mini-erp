// services/auth.ts
'use client'

import api from "../../lib/client/api";
import {
  addFingerprintHeader,
} from "@/lib/client/fingerprint";
import { refreshTokenAction } from "@/actions/token";
import type {
  RegisterData,
  ApiResponse,
  User,
} from "@/types/api";

// ============================================================================
// Auth API Functions
// ============================================================================

/**
 * Register nuovo utente
 */
export async function register(userData: RegisterData): Promise<User> {
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
 * Refresh token
 * ✅ Usa Server Action invece di API Route
 */
export async function refreshToken(): Promise<boolean> {
  try {
    console.log('🔄 Refreshing tokens via Server Action...');
    
    // ✅ Chiama Server Action
    const result = await refreshTokenAction();

    if (!result.success) {
      console.error("❌ Token refresh failed");
      return false;
    }

    console.log("✅ Token refreshed successfully");
    return true;
  } catch (error) {
    console.error("❌ Token refresh request failed:", error);
    return false;
  }
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
