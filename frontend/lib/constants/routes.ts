// lib/constants/routes.ts

export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  AUTH: {
    DEFAULT: '/dashboard',
    PROFILE: '/profile',
  },
  ADMIN: {
    USERS: '/users',
    ROLES: '/roles',
    SETTINGS: '/settings',
  },
} as const;

// Crea array con tipo corretto
export const PUBLIC_ROUTES: string[] = Object.values(ROUTES.PUBLIC);
export const ADMIN_ROUTES: string[] = Object.values(ROUTES.ADMIN);

// Type guard functions
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}