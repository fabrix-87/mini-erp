// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { decodeJWT, isTokenExpired } from "./lib/jwt";
import { getAccessToken, isAdmin, redirectToLogin } from "./helpers/auth-helper";
import { isPublicRoute, isAdminRoute } from "./lib/constants/routes";

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_AUTH_ROUTE = "/dashboard";
const DEFAULT_PUBLIC_ROUTE = "/login";

// ============================================================================
// Main Middleware Logic
// ============================================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // 0. Handle session expired cleanup
  // ========================================
  if (pathname === "/login" && request.nextUrl.searchParams.get("session_expired") === "true") {
    console.log("🧹 Clearing stale auth cookies after session expiry");
    // Redirect to /login clean (senza query param) cancellando i cookie
    const cleanLoginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(cleanLoginUrl);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("tokenTimestamp");
    response.cookies.delete("user");
    return response;
  }

  // ========================================
  // 1. Exclude static files and API routes
  // ========================================
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // ========================================
  // 2. Get and validate token
  // ========================================
  const accessToken = getAccessToken(request);
  const payload = accessToken ? decodeJWT(accessToken) : null;
  const isAuthenticated = payload && !isTokenExpired(payload);

  // ========================================
  // 3. Root route handling
  // ========================================
  if (pathname === "/") {
    if (isAuthenticated) {
      console.log("🔀 Root redirect: Authenticated → /dashboard");
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    } else {
      console.log("🔀 Root redirect: Not authenticated → /login");
      return NextResponse.redirect(new URL(DEFAULT_PUBLIC_ROUTE, request.url));
    }
  }

  // ========================================
  // 4. Public routes handling
  // ========================================
  if (isPublicRoute(pathname)) {
    if (isAuthenticated) {
      console.log("🔀 Already authenticated, redirecting to /dashboard");
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    }
    return NextResponse.next();
  }

  // ========================================
  // 5. Protected routes - Check authentication
  // ========================================
  if (!accessToken) {
    console.log("⚠️ No access token found");
    return redirectToLogin(request);
  }

  if (!payload) {
    console.log("⚠️ Invalid token format");
    return redirectToLogin(request);
  }

  // NEW: se il token è scaduto, tenta un refresh server-side nel middleware
  // Se fallisce (es. Redis reset), redirect a login pulendo i cookie
  if (isTokenExpired(payload)) {
    console.log("⚠️ Token expired, attempting server-side refresh...");

    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      console.log("⚠️ No refresh token, redirecting to login");
      return redirectToLogin(request);
    }

    try {
      const backendUrl = process.env.API_URL ?? "http://localhost:5000";
      const refreshRes = await fetch(`${backendUrl}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refreshToken=${refreshToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!refreshRes.ok) {
        console.log("❌ Refresh failed in middleware, redirecting to login");
        const response = redirectToLogin(request);
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        response.cookies.delete("tokenTimestamp");
        response.cookies.delete("user");
        return response;
      }

      // ✅ Leggi i token dai Set-Cookie headers (non dal body)
      const response = NextResponse.next();
      const setCookieHeaders = refreshRes.headers.getSetCookie?.() ?? [];

      for (const cookieStr of setCookieHeaders) {
        if (cookieStr.startsWith("accessToken=")) {
          const value = cookieStr.split(";")[0].split("=")[1];
          response.cookies.set("accessToken", value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
          });
        }
        if (cookieStr.startsWith("refreshToken=")) {
          const value = cookieStr.split(";")[0].split("=")[1];
          response.cookies.set("refreshToken", value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
          });
        }
      }

      return response;
    } catch (err) {
      console.error("❌ Middleware refresh error:", err);
      return redirectToLogin(request);
    }
  }

  // ========================================
  // 6. Admin routes - Check permissions
  // ========================================
  if (isAdminRoute(pathname)) {
    if (!isAdmin(payload)) {
      console.log("⛔ Admin access denied");
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    }
  }

  // ========================================
  // 7. Allow access
  // ========================================
  return NextResponse.next();
}

// ============================================================================
// Middleware Configuration
// ============================================================================

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
