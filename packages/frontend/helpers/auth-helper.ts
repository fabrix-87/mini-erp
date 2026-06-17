// helpers/auth.ts
import { UserSessionPayload } from "@mini-erp/shared";
import { NextRequest, NextResponse } from "next/server";

const LOGIN_ROUTE = '/login';

/**
 * Legge accessToken dal cookie della richiesta
 */
export function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get('accessToken')?.value || null;
}

/**
 * Legge refreshToken dal cookie della richiesta
 */
export function getRefreshToken(request: NextRequest): string | null {
  return request.cookies.get('refreshToken')?.value || null;
}

/**
 * Controlla se l'utente ha ruolo admin
 */
export function isAdmin(payload: UserSessionPayload): boolean {
  return payload.currentTenant.roles.some(
    (role) => role.code === 'ADMIN' || role.code === 'SUPER_ADMIN'
  );
}

/**
 * Aggiunge headers utente alla richiesta
 */
export function addUserHeaders(
  response: NextResponse,
  payload: UserSessionPayload
): NextResponse {
  response.headers.set('x-user-id', payload.userId.toString());
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-user-username', payload.username);
  response.headers.set('x-user-roles', JSON.stringify(payload.currentTenant.roles));
  return response;
}

/**
 * Crea redirect response con cleanup cookies
 */
export function redirectToLogin(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  response.cookies.delete('user');
  return response;
}

