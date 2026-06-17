// types/user.ts
import type { UserSessionPayload } from "@mini-erp/shared";
export type { UserSessionPayload } from "@mini-erp/shared";

// ============================================================================
// JWT & Token Types
// ============================================================================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  jti?: string; // JWT ID per access token
  refreshTokenId?: string; // JWT ID per refresh token
}

// ============================================================================
// Hono Auth Context Types
// ============================================================================

/**
 * Authenticated request user stored inside the Hono context.
 */
export interface AuthContextUser extends UserSessionPayload {}

/**
 * JWT payload stored in the Hono context after token validation.
 */
export interface AuthJwtPayload {
  sub: string;
  email: string;
  type: "access" | "refresh";
  jti?: string;
  refreshTokenId?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

// ============================================================================
// Session Types (Redis)
// ============================================================================

export interface SessionData {
  userId: string;
  username: string;
  email: string;
  currentTenant: {
    tenantId: string;
    membershipId: string;
    status: "ACTIVE" | "INVITED" | "SUSPENDED";
    roles: Array<{ id: number; code: string; name: string }>;
    permissions: string[];
  };
  fingerprint?: string;
  loginAt: string; // ISO string — Date non è serializzabile in Redis JSON
  lastActivity: string; // ISO string
  metadata?: {
    ip?: string;
    userAgent?: string;
    device?: string;
  };
}

// ============================================================================
// Auth Config Types
// ============================================================================

export interface AuthConfig {
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    expiresInMs: number;
    refreshExpiresInMs: number;
    issuer: string;
    audience: string;
    refreshThresholdMs: number;
  };
  fingerprint: {
    enabled: boolean;
    algorithm: string;
  };
  session: {
    ttl: number;
    sliding: boolean;
  };
  security: {
    maxConcurrentSessions: number;
    singleRefreshToken: boolean;
  };
  isProduction: boolean;
}
