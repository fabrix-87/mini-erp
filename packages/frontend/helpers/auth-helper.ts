// helpers/auth-helper.ts
import { UserSessionPayload } from "@mini-erp/shared";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/types/cookie-types";

const LOGIN_ROUTE = "/login";

/** Admin role codes that grant elevated access. */
const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

// ============================================================================
// Token helpers
// ============================================================================

/**
 * Reads the `accessToken` cookie from an incoming Edge request.
 *
 * @returns The raw JWT string, or `null` if absent.
 */
export function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value ?? null;
}

/**
 * Reads the `refreshToken` cookie from an incoming Edge request.
 *
 * @returns The raw JWT string, or `null` if absent.
 */
export function getRefreshToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value ?? null;
}

// ============================================================================
// Authorization helpers
// ============================================================================

/**
 * Returns `true` if the user payload contains at least one admin-level role.
 *
 * @param payload - Decoded JWT user session payload.
 */
export function isAdmin(payload: UserSessionPayload): boolean {
  return payload.currentTenant.roles.some((role) => ADMIN_ROLES.has(role.code));
}

// ============================================================================
// Response helpers
// ============================================================================

/**
 * Adds user identity headers to a NextResponse for downstream consumption
 * (e.g. logging, tracing, backend forwarding).
 *
 * @param response - The response to mutate.
 * @param payload - Decoded JWT user session payload.
 * @returns The mutated response.
 */
export function addUserHeaders(response: NextResponse, payload: UserSessionPayload): NextResponse {
  response.headers.set("x-user-id", payload.userId.toString());
  response.headers.set("x-user-email", payload.email);
  response.headers.set("x-user-username", payload.username);
  response.headers.set("x-user-roles", JSON.stringify(payload.currentTenant.roles));
  return response;
}

/**
 * Creates a redirect response to `/login?callbackUrl=<currentPath>`,
 * deleting all auth cookies so the browser clears the stale session.
 *
 * @param request - The incoming NextRequest.
 * @returns A redirect `NextResponse` with auth cookies deleted.
 */
export function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL(LOGIN_ROUTE, request.url);

  // Preserva il path originale (escludi /login stesso per evitare loop)
  const { pathname, search } = request.nextUrl;
  if (pathname !== LOGIN_ROUTE) {
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
  }

  const response = NextResponse.redirect(loginUrl);
  Object.values(COOKIE_NAMES).forEach((name) => response.cookies.delete(name));
  return response;
}
