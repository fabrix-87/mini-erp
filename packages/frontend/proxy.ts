// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { decodeJWT, isTokenExpired } from "./lib/jwt";
import { getAccessToken, isAdmin, redirectToLogin } from "./helpers/auth-helper";
import { isPublicRoute, isAdminRoute } from "./lib/constants/routes";
import {
  ACCESS_TOKEN_LIFETIME_SECONDS,
  REFRESH_TOKEN_LIFETIME_SECONDS,
} from "./lib/constants/auth";
import { COOKIE_NAMES } from "./types/cookie-types";

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_AUTH_ROUTE = "/dashboard";
const DEFAULT_PUBLIC_ROUTE = "/login";
const API_BASE_URL = process.env.API_URL ?? "http://localhost:5000";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Deletes all auth cookies on a given NextResponse.
 * NOTE: This operates on the *outgoing response* (Edge runtime),
 * not the server-side cookie store — use the `clearAuthCookies` server
 * helper from `lib/server/auth-cookie-helper.ts` in Server Actions instead.
 */
function clearResponseCookies(response: NextResponse): void {
  Object.values(COOKIE_NAMES).forEach((name) => response.cookies.delete(name));
}

/**
 * Copies `accessToken` and `refreshToken` from a backend `Set-Cookie` header
 * into a NextResponse, preserving HttpOnly + security attributes.
 *
 * Uses `indexOf("=")` instead of `split("=")[1]` to handle Base64 padding
 * characters (`=`) that may appear in JWT values.
 *
 * @param setCookieHeaders - Raw Set-Cookie strings from the backend response.
 * @param response - The NextResponse to write cookies onto.
 */
function forwardTokenCookies(setCookieHeaders: string[], response: NextResponse): void {
  for (const cookieStr of setCookieHeaders) {
    const [nameValue] = cookieStr.split(";");
    const eqIndex = nameValue.indexOf("=");
    const name = nameValue.substring(0, eqIndex).trim();
    const value = nameValue.substring(eqIndex + 1).trim();

    if (name === COOKIE_NAMES.ACCESS_TOKEN) {
      response.cookies.set(name, value, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        path: "/",
        sameSite: "lax",
        maxAge: ACCESS_TOKEN_LIFETIME_SECONDS,
      });
    } else if (name === COOKIE_NAMES.REFRESH_TOKEN) {
      response.cookies.set(name, value, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        path: "/",
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_LIFETIME_SECONDS,
      });
    }
  }
}

/**
 * Creates a NextResponse.next() with the current pathname injected as
 * `x-pathname` header, so that next-intl `request.ts` can resolve
 * the correct i18n namespace without needing a separate middleware.
 *
 * @param request - The incoming NextRequest.
 */
function nextWithPathname(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

// ============================================================================
// Main Middleware Logic
// ============================================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // 0. Static assets and API routes — skip
  // ========================================
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // ========================================
  // 1. Session expired cleanup
  // ========================================
  if (pathname === "/login" && request.nextUrl.searchParams.get("session_expired") === "true") {
    console.log("🧹 Clearing stale auth cookies after session expiry");
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearResponseCookies(response);
    return response;
  }

  // ========================================
  // 2. Get and validate access token
  // ========================================
  const accessToken = getAccessToken(request);
  const payload = accessToken ? decodeJWT(accessToken) : null;
  const authenticated = !!payload && !isTokenExpired(payload);

  // ========================================
  // 3. Root redirect
  // ========================================
  if (pathname === "/") {
    const target = authenticated ? DEFAULT_AUTH_ROUTE : DEFAULT_PUBLIC_ROUTE;
    return NextResponse.redirect(new URL(target, request.url));
  }

  // ========================================
  // 4. Public routes
  // ========================================
  if (isPublicRoute(pathname)) {
    if (authenticated) {
      console.log("🔀 Already authenticated, redirecting to /dashboard");
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    }
    return nextWithPathname(request);
  }

  // ========================================
  // 5. Protected routes — no token at all
  // ========================================
  if (!accessToken) {
    console.log("⚠️ No access token found");
    return redirectToLogin(request);
  }

  if (!payload) {
    console.log("⚠️ Invalid token format");
    return redirectToLogin(request);
  }

  // ========================================
  // 6. Protected routes — token expired, attempt server-side refresh
  // ========================================
  if (isTokenExpired(payload)) {
    console.log("⚠️ Token expired, attempting server-side refresh...");

    const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
    if (!refreshToken) {
      console.log("⚠️ No refresh token available");
      return redirectToLogin(request);
    }

    try {
      const fingerprint =
        request.cookies.get("device-fp")?.value ??
        request.headers.get("x-device-fingerprint") ??
        "";

      const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`,
          ...(fingerprint && { "X-Device-Fingerprint": fingerprint }),
        },
      });

      if (!refreshRes.ok) {
        console.log("❌ Refresh failed in middleware, redirecting to login");
        const response = redirectToLogin(request);
        clearResponseCookies(response);
        return response;
      }

      const response = NextResponse.next();
      forwardTokenCookies(refreshRes.headers.getSetCookie?.() ?? [], response);
      response.headers.set("x-pathname", pathname);
      return response;
    } catch (err) {
      console.error("❌ Middleware refresh error:", err);
      return redirectToLogin(request);
    }
  }

  // ========================================
  // 7. Admin routes — check permissions
  // ========================================
  if (isAdminRoute(pathname) && !isAdmin(payload)) {
    console.log("⛔ Admin access denied");
    return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
  }

  // ========================================
  // 8. Allow access
  // ========================================
  return nextWithPathname(request);
}

// ============================================================================
// Middleware Configuration
// ============================================================================

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
