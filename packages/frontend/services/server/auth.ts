// services/server/auth.ts
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/server/api";
import { AuthResponse } from "@/types/api";
import { forwardTokenCookiesFromResponse, setCookies } from "@/lib/server/cookies";
import { getCookiesString } from "@/lib/server/cookies";
import { getFingerprintForSSR } from "@/lib/server/fingerprint";

/**
 * Performs a token refresh by calling the backend.
 * Reads the new tokens from Set-Cookie response headers and forwards them
 * to the browser via the Next.js cookie store.
 *
 * @returns The AuthResponse payload on success, null on failure.
 */
export async function performTokenRefresh(): Promise<AuthResponse | null> {
  const cookieStore = await cookies();
  const currentRefreshToken = cookieStore.get("refreshToken")?.value;

  if (!currentRefreshToken) {
    console.log("⚠️ No refresh token available");
    return null;
  }

  try {
    const cookiesString = await getCookiesString();
    const fingerprint = await getFingerprintForSSR();

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesString,
        "X-Device-Fingerprint": fingerprint,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error("❌ Token refresh failed with status:", response.status);
      return null;
    }

    const json = await response.json();
    const data: AuthResponse = json.data;

    // Forward tokens from Set-Cookie headers to the browser
    await forwardTokenCookiesFromResponse(response);

    // Aggiorna solo i cookie non sensibili
    await setCookies(data.user);

    return data;
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    return null;
  }
}

/**
 * Notifies the backend of a logout attempt.
 * Does not throw on failure — local cookie cleanup must happen regardless.
 */
export async function logoutUser(): Promise<void> {
  try {
    const cookiesString = await getCookiesString();
    const fingerprint = await getFingerprintForSSR();

    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesString,
        "X-Device-Fingerprint": fingerprint,
      },
      body: JSON.stringify({}),
    });
  } catch (error) {
    console.warn("⚠️ Backend logout failed (cleaning up locally anyway):", error);
  }
}
