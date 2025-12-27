import { JWTPayload } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

const LOGIN_ROUTE = '/login';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
export function isAdmin(payload: JWTPayload): boolean {
  return payload.roles.some(
    (role) => role.code === 'ADMIN' || role.code === 'SUPER_ADMIN'
  );
}

/**
 * Aggiunge headers utente alla richiesta
 */
export function addUserHeaders(
  response: NextResponse,
  payload: JWTPayload
): NextResponse {
  response.headers.set('x-user-id', payload.userId.toString());
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-user-username', payload.username);
  response.headers.set('x-user-roles', JSON.stringify(payload.roles));
  return response;
}

/**
 * Crea redirect response con cleanup cookies
 */
export function redirectToLogin(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}

/**
 * Chiama backend per refresh token
 */
export async function refreshTokens(
  request: NextRequest
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const refreshToken = getRefreshToken(request);

  if (!refreshToken) {
    console.log('⚠️ No refresh token available');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.log('❌ Refresh token failed:', response.status);
      return null;
    }

    // Estrai nuovi token dai Set-Cookie headers
    const setCookieHeaders = response.headers.getSetCookie();
    
    let newAccessToken = '';
    let newRefreshToken = '';

    setCookieHeaders.forEach((cookie) => {
      if (cookie.startsWith('accessToken=')) {
        newAccessToken = cookie.split(';')[0].split('=')[1];
      }
      if (cookie.startsWith('refreshToken=')) {
        newRefreshToken = cookie.split(';')[0].split('=')[1];
      }
    });

    if (!newAccessToken || !newRefreshToken) {
      console.error('❌ Failed to extract tokens from Set-Cookie headers');
      return null;
    }

    console.log('✅ Tokens refreshed successfully');
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.error('❌ Refresh request failed:', error);
    return null;
  }
}
