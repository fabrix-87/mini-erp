import { NextRequest, NextResponse } from "next/server";
import {
  verifyJWT,
  isTokenExpiringSoon,
  isTokenExpired,
} from './lib/jwt';
import { addUserHeaders, getAccessToken, isAdmin, redirectToLogin, refreshTokens } from "./helpers/auth";

// ============================================================================
// Configuration
// ============================================================================

const PUBLIC_ROUTES = ['/login', '/forgot-password'];
const ADMIN_ROUTES = ['/users', '/roles', '/settings'];
const DEFAULT_AUTH_ROUTE = '/dashboard';

// Threshold per refresh proattivo (5 minuti)
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// ============================================================================
// Main Middleware Logic
// ============================================================================
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // 1. Allow public routes
  // ========================================
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // ========================================
  // 2. Exclude static files and API routes
  // ========================================
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ========================================
  // 3. Get and verify access token (LOCAL)
  // ========================================
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    console.log('⚠️ No access token found');
    return redirectToLogin(request);
  }

  // Verifica JWT localmente (NO backend call)
  let payload = await verifyJWT(accessToken);

  // ========================================
  // 4. Handle expired or invalid token
  // ========================================
  if (!payload || isTokenExpired(payload)) {
    console.log('🔄 Token expired, attempting refresh...');

    const newTokens = await refreshTokens(request);

    if (!newTokens) {
      console.log('❌ Refresh failed, redirecting to login');
      return redirectToLogin(request);
    }

    // Verifica nuovo token
    payload = await verifyJWT(newTokens.accessToken);

    if (!payload) {
      console.log('❌ New token invalid, redirecting to login');
      return redirectToLogin(request);
    }

    // Crea response con nuovi cookies
    const response = NextResponse.next();
    
    response.cookies.set('accessToken', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minuti
      path: '/',
    });

    response.cookies.set('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 giorni
      path: '/api/users/refresh-token',
    });

    return addUserHeaders(response, payload);
  }

  // ========================================
  // 5. Proactive token refresh (if expiring soon)
  // ========================================
  if (isTokenExpiringSoon(payload, REFRESH_THRESHOLD_MS)) {
    console.log('⏰ Token expiring soon, proactive refresh...');

    const newTokens = await refreshTokens(request);

    if (newTokens) {
      const newPayload = await verifyJWT(newTokens.accessToken);

      if (newPayload) {
        console.log('✅ Proactive refresh successful');
        
        const response = NextResponse.next();
        
        response.cookies.set('accessToken', newTokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60,
          path: '/',
        });

        response.cookies.set('refreshToken', newTokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60,
          path: '/api/users/refresh-token',
        });

        return addUserHeaders(response, newPayload);
      }
    }

    console.log('⚠️ Proactive refresh failed, continuing with current token');
  }

  // ========================================
  // 6. Check admin routes permissions
  // ========================================
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAdmin(payload)) {
      console.log('⛔ Admin access denied');
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    }
  }

  // ========================================
  // 7. Allow access with user headers
  // ========================================
  const response = NextResponse.next();
  return addUserHeaders(response, payload);
}

// ============================================================================
// Middleware Configuration
// ============================================================================

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
