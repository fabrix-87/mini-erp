// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { decodeJWT, isTokenExpired } from './lib/jwt';
import { 
  getAccessToken, 
  isAdmin, 
  redirectToLogin 
} from "./helpers/auth";

// ============================================================================
// Configuration
// ============================================================================

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];
const ADMIN_ROUTES = ['/users', '/roles', '/settings'];
const DEFAULT_AUTH_ROUTE = '/dashboard';

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
  // 3. Check authentication
  // ========================================
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    console.log('⚠️ No access token found');
    return redirectToLogin(request);
  }

  // ✅ Solo decode (no verify)
  const payload = decodeJWT(accessToken);

  if (!payload) {
    console.log('⚠️ Invalid token format');
    return redirectToLogin(request);
  }

  // ✅ Se scaduto, lascia passare - l'interceptor gestirà il refresh
  if (isTokenExpired(payload)) {
    console.log('⚠️ Token expired, will be refreshed by API interceptor');
    // Non bloccare - lascia che l'app carichi e l'interceptor gestisca
  }

  // ========================================
  // 4. Check admin routes permissions
  // ========================================
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAdmin(payload)) {
      console.log('⛔ Admin access denied');
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    }
  }

  // ========================================
  // 5. Allow access
  // ========================================
  return NextResponse.next();
}

// ============================================================================
// Middleware Configuration
// ============================================================================

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
