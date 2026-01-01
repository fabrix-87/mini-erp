// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import {
  verifyJWT,
  isTokenExpiringSoon,
  isTokenExpired,
} from './lib/jwt';
import { 
  addUserHeaders, 
  getAccessToken, 
  isAdmin, 
  redirectToLogin, 
  refreshTokens 
} from "./helpers/auth";

// ============================================================================
// Configuration
// ============================================================================

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];
const ADMIN_ROUTES = ['/users', '/roles', '/settings'];
const DEFAULT_AUTH_ROUTE = '/dashboard';

// Threshold per refresh proattivo (5 minuti)
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Imposta i cookie dei nuovi token
 */
function setTokenCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minuti
    path: '/',
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 giorni
    path: '/',
  });
}

/**
 * Gestisce il refresh dei token e ritorna una response aggiornata
 */
async function handleTokenRefresh(
  request: NextRequest,
  reason: 'expired' | 'expiring-soon'
): Promise<NextResponse | null> {
  console.log(`🔄 Token ${reason === 'expired' ? 'expired' : 'expiring soon'}, refreshing...`);
  
  const newTokens = await refreshTokens(request);
  
  if (!newTokens) {
    console.log('❌ Refresh failed');
    return null;
  }

  // Verifica nuovo token
  const newPayload = await verifyJWT(newTokens.accessToken);
  
  if (!newPayload) {
    console.log('❌ New token invalid');
    return null;
  }

  const response = NextResponse.next();
  setTokenCookies(response, newTokens.accessToken, newTokens.refreshToken);
  
  console.log('✅ Tokens refreshed successfully');
  return addUserHeaders(response, newPayload);
}

// ============================================================================
// Main Middleware Logic
// ============================================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // 1. Exclude static files and API routes
  // ========================================
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ========================================
  // 2. Allow public routes
  // ========================================
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // ========================================
  // 3. Get and verify access token
  // ========================================
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    console.log('⚠️ No access token found');
    return redirectToLogin(request);
  }

  // Verifica JWT localmente (NO backend call)
  let payload = await verifyJWT(accessToken);

  // ========================================
  // 4. Handle expired token
  // ========================================
  if (!payload || isTokenExpired(payload)) {
    const response = await handleTokenRefresh(request, 'expired');
    
    if (!response) {
      return redirectToLogin(request);
    }
    
    return response;
  }

  // ========================================
  // 5. Proactive token refresh (if expiring soon)
  // ========================================
  if (isTokenExpiringSoon(payload, REFRESH_THRESHOLD_MS)) {
    const response = await handleTokenRefresh(request, 'expiring-soon');
    
    // Se il refresh proattivo fallisce, continua con il token corrente
    if (response) {
      return response;
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
