import { Request } from "express";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserPayload {
  userId: number;
  email: string;
  username: string;
  roles: Array<{ id: number; code: string; name: string }>;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface AuthConfig {
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    expiresInMs: number; 
    refreshExpiresInMs: number; 
  };
  isProduction: boolean;
}
