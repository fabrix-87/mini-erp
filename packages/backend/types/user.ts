// types/user.ts
import { UserPayload } from "@mini-erp/shared";
import { Request } from "express";
export { UserPayload } from "@mini-erp/shared";

// ============================================================================
// JWT & Token Types
// ============================================================================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  jti?: string;           // JWT ID per access token
  refreshTokenId?: string; // JWT ID per refresh token
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
  fingerprint?: string;
  loginAt: Date;
  lastActivity: Date;
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