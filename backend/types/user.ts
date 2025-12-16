// types/user.ts
import { Request } from "express";

// ============================================================================
// JWT & Token Types
// ============================================================================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  jti?: string;           // JWT ID per access token
  refreshTokenId?: string; // JWT ID per refresh token
}

export interface UserPayload {
  userId: number;
  email: string;
  username: string;
  roles: Array<{
    id: number;
    code: string;
    name: string;
  }>;
  fingerprint?: string; // Browser fingerprint
  jti?: string;        // JWT ID
  iat?: number;        // Issued at
  exp?: number;        // Expires at
  iss?: string;        // Issuer
  aud?: string;        // Audience
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

// ============================================================================
// Session Types (Redis)
// ============================================================================

export interface SessionData {
  userId: number;
  username: string;
  email: string;
  roles: Array<{
    id: number;
    code: string;
    name: string;
  }>;
  fingerprint: string;
  loginAt: string;
  lastActivity: string;
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