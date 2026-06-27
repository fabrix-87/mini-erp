// actions/token-actions.ts
"use server";

import { cookies } from "next/headers";
import { performTokenRefresh } from "@/services/server/auth-service";
import { COOKIE_NAMES } from "@/types/cookie-types";

// ============================================================================
// Types
// ============================================================================

interface RefreshTokenResult {
  success: boolean;
  forceLogout?: boolean;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Attempts a proactive token refresh via the backend.
 *
 * Returns `forceLogout: true` when the refresh token is invalid or expired,
 * signalling the `AuthProvider` to clear the session and redirect to login.
 *
 * @returns `{ success: true }` on success, `{ success: false, forceLogout: true }` on failure.
 */
export async function refreshTokenAction(): Promise<RefreshTokenResult> {
  try {
    const result = await performTokenRefresh();

    if (!result) {
      console.error("❌ Token refresh failed");
      return { success: false, forceLogout: true };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Refresh token action error:", error);
    return { success: false, forceLogout: true };
  }
}

/**
 * Checks whether the user has a valid access token cookie.
 * Lightweight alternative to full JWT decoding for quick auth checks.
 *
 * @returns `{ authenticated: true }` if the access token cookie is present.
 */
export async function checkAuthAction(): Promise<{ authenticated: boolean }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  return { authenticated: !!accessToken };
}
