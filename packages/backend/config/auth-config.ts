// config/auth.ts
import type { AuthConfig } from "../types/user-types";
import { safeMs } from "../helpers/auth-helper"

/**
 * Central authentication and JWT configuration.
 * All auth-related settings are derived from environment variables
 * with safe fallbacks for development.
 */
const authConfig: AuthConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    
    // Pre-calcola i millisecondi
    expiresInMs: safeMs(process.env.JWT_EXPIRES_IN || "15m", 15 * 60 * 1000),
    refreshExpiresInMs: safeMs(
      process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      7 * 24 * 60 * 60 * 1000
    ),
    
    // JWT Claims standard
    issuer: process.env.JWT_ISSUER || "mini-erp-backend",
    audience: process.env.JWT_AUDIENCE || "mini-erp-frontend",
    
    // Token rotation: refresh automatico se < 5 minuti alla scadenza
    refreshThresholdMs: 5 * 60 * 1000, // 5 minuti
  },
  
  // Fingerprinting per prevenire token theft
  fingerprint: {
    enabled: process.env.FINGERPRINT_ENABLED !== 'false', // Default: true
    algorithm: 'sha256',
  },
  
  // Session management
  session: {
    // TTL session in Redis (uguale a refresh token)
    ttl: safeMs(process.env.JWT_REFRESH_EXPIRES_IN || "7d", 7 * 24 * 60 * 60 * 1000) / 1000, // in secondi
    
    // Sliding session: aggiorna TTL ad ogni richiesta
    sliding: process.env.SESSION_SLIDING !== 'false', // Default: true
  },
  
  // Security
  security: {
    // Max sessioni attive contemporanee per utente
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5', 10),
    
    // Permetti solo 1 refresh token attivo per volta
    singleRefreshToken: process.env.SINGLE_REFRESH_TOKEN === 'true', // Default: false (permetti multiple)
  },
  
  isProduction: process.env.NODE_ENV === "production",
} as const;

export default authConfig;
