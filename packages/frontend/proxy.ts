// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { decodeJWT, isTokenExpired } from './lib/jwt';
import { 
  getAccessToken, 
  isAdmin, 
  redirectToLogin 
} from "./helpers/auth";
import { isPublicRoute, isAdminRoute } from './lib/constants/routes'; 

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_AUTH_ROUTE = '/dashboard';
const DEFAULT_PUBLIC_ROUTE = '/login';

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
  // 2. Get and validate token
  // ========================================
  const accessToken = getAccessToken(request);
  const payload = accessToken ? decodeJWT(accessToken) : null;
  const isAuthenticated = payload && !isTokenExpired(payload);

  // ========================================
  // 3. Root route handling
  // ========================================
  if (pathname === '/') {
    if (isAuthenticated) {
      console.log('🔀 Root redirect: Authenticated → /dashboard');
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    } else {
      console.log('🔀 Root redirect: Not authenticated → /login');
      return NextResponse.redirect(new URL(DEFAULT_PUBLIC_ROUTE, request.url));
    }
  }

  // ========================================
  // 4. Public routes handling
  // ========================================
  if (isPublicRoute(pathname)) {
    if (isAuthenticated) {
      console.log('🔀 Already authenticated, redirecting to /dashboard');
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    }
    return NextResponse.next();
  }

  // ========================================
  // 5. Protected routes - Check authentication
  // ========================================
  if (!accessToken) {
    console.log('⚠️ No access token found');
    return redirectToLogin(request);
  }

  if (!payload) {
    console.log('⚠️ Invalid token format');
    return redirectToLogin(request);
  }

  if (isTokenExpired(payload)) {
    console.log('⚠️ Token expired, will be refreshed by API interceptor');
  }

  // ========================================
  // 6. Admin routes - Check permissions
  // ========================================
  if (isAdminRoute(pathname)) {
    if (!isAdmin(payload)) {
      console.log('⛔ Admin access denied');
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
