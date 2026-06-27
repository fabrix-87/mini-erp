// services/server/auth.ts
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/server/api";
import { AuthResponse } from "@/types/api";
import {
  forwardTokenCookiesFromResponse,
  setCookies,
  getCookiesString,
} from "@/lib/server/cookies";
import { getFingerprintForSSR } from "@/lib/server/fingerprint";
import { COOKIE_NAMES } from "@/types/cookie-types";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Builds the common headers for authenticated backend requests,
 * forwarding the current session cookies and device fingerprint.
 *
 * @returns Headers object ready to be spread into a `fetch` call.
 */
async function buildAuthHeaders(): Promise<HeadersInit> {
  const [cookiesString, fingerprint] = await Promise.all([
    getCookiesString(),
    getFingerprintForSSR(),
  ]);

  return {
    "Content-Type": "application/json",
    Cookie: cookiesString,
    "X-Device-Fingerprint": fingerprint,
  };
}

// ============================================================================
// Services
// ============================================================================

/**
 * Performs a proactive token refresh against the backend.
 *
 * Reads the current refresh token from the server-side cookie store,
 * calls `/auth/refresh-token`, then forwards the new HttpOnly token cookies
 * from the backend `Set-Cookie` headers and updates the non-sensitive
 * client-readable cookies (`user`, `tokenTimestamp`).
 *
 * @returns The refreshed `AuthResponse` payload on success, `null` on failure.
 */
export async function performTokenRefresh(): Promise<AuthResponse | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    console.warn("⚠️ No refresh token available");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: await buildAuthHeaders(),
    });

    if (!response.ok) {
      console.error("❌ Token refresh failed with status:", response.status);
      return null;
    }

    const json = await response.json();
    const data: AuthResponse = json.data;

    await forwardTokenCookiesFromResponse(response);
    await setCookies(data.user);

    return data;
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    return null;
  }
}

/**
 * Notifies the backend of a user logout to invalidate the Redis session.
 *
 * This call is best-effort — local cookie cleanup proceeds regardless
 * of whether the backend request succeeds.
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: await buildAuthHeaders(),
    });
  } catch (error) {
    console.warn("⚠️ Backend logout failed (cleaning up locally anyway):", error);
  }
}
