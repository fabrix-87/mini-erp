// lib/server/cookies.ts
import { cookies } from "next/headers";
import { ACCESS_TOKEN_LIFETIME_SECONDS, REFRESH_TOKEN_LIFETIME_SECONDS } from "../constants/auth";
import { User } from "@mini-erp/shared";
import { COOKIE_NAMES } from "@/types/cookie-types";

const isProduction = process.env.NODE_ENV === "production";

/** Shared base options for non-sensitive client-readable cookies. */
const clientCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  path: "/",
  sameSite: "lax",
  maxAge: ACCESS_TOKEN_LIFETIME_SECONDS,
} as const;

/** Shared base options for HttpOnly token cookies. */
const httpOnlyCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  path: "/",
  sameSite: "lax",
} as const;

// ============================================================================
// Read
// ============================================================================

/**
 * Builds a Cookie header string from the current server-side cookie store,
 * forwarding `accessToken` and `refreshToken` to outgoing backend requests.
 *
 * @returns Semicolon-separated cookie string, or empty string on failure.
 */
export async function getCookiesString(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const parts: string[] = [];

    const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (accessToken) parts.push(`${COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}`);
    if (refreshToken) parts.push(`${COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`);

    return parts.join("; ");
  } catch (error) {
    console.error("Failed to read cookies:", error);
    return "";
  }
}

/**
 * Reads and parses the `user` cookie from the server-side cookie store.
 *
 * @returns The parsed `User` object, or `null` if absent or malformed.
 */
export async function getUserFromCookiesSSR(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAMES.USER)?.value;

    if (!raw) return null;

    return JSON.parse(decodeURIComponent(raw)) as User;
  } catch (error) {
    console.error("❌ Failed to parse user cookie:", error);
    return null;
  }
}

// ============================================================================
// Write
// ============================================================================

/**
 * Sets non-sensitive authentication cookies after a successful login or token refresh.
 *
 * ⚠️ SECURITY NOTE: The `user` cookie is intentionally NOT HttpOnly and is
 * intended for client-side UI rendering only (AuthProvider, display purposes).
 * It must NEVER be used for server-side authorization decisions — always use
 * `fetchSessionPayload()` / `requireAuth()` which verify the JWT via the backend.
 * 
 * @param user - The authenticated user payload to persist client-side.
 */
export async function setCookies(user: User): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAMES.USER, JSON.stringify(user), clientCookieOptions);
  cookieStore.set(COOKIE_NAMES.TOKEN_TIMESTAMP, String(Date.now()), clientCookieOptions);
}

/**
 * Forwards `accessToken` and `refreshToken` from a backend `Response`'s
 * `Set-Cookie` headers into the Next.js server-side cookie store,
 * so they are propagated to the browser as HttpOnly cookies.
 *
 * This is necessary because server-side `fetch()` calls (Server Actions,
 * Route Handlers) do not automatically forward `Set-Cookie` headers from
 * upstream responses to the client — they must be re-set explicitly via
 * the Next.js cookie store.
 *
 * Token attributes (httpOnly, secure, sameSite, maxAge) are re-applied
 * consistently regardless of what the backend originally set.
 *
 * @param response - The raw `Response` object returned by a `fetch()` call
 *                   to the backend authentication endpoints (login, refresh).
 */
export async function forwardTokenCookiesFromResponse(response: Response): Promise<void> {
  const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
  if (setCookieHeaders.length === 0) return;

  const cookieStore = await cookies();

  for (const cookieStr of setCookieHeaders) {
    const [nameValue] = cookieStr.split(";");
    const eqIndex = nameValue.indexOf("=");
    const name = nameValue.substring(0, eqIndex).trim();
    const value = nameValue.substring(eqIndex + 1).trim();

    if (name === COOKIE_NAMES.ACCESS_TOKEN) {
      cookieStore.set(name, value, {
        ...httpOnlyCookieOptions,
        maxAge: ACCESS_TOKEN_LIFETIME_SECONDS,
      });
    } else if (name === COOKIE_NAMES.REFRESH_TOKEN) {
      cookieStore.set(name, value, {
        ...httpOnlyCookieOptions,
        maxAge: REFRESH_TOKEN_LIFETIME_SECONDS,
      });
    }
  }
}
