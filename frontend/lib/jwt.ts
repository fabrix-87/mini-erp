// lib/jwt.ts
import { JWTPayload } from "@/types/api";
import * as jose from "jose";

// ============================================================================
// JWT Configuration
// ============================================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

const JWT_ISSUER = process.env.JWT_ISSUER || "your-app-backend";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "your-app-frontend";

// ============================================================================
// JWT Verification (Local - No Backend Call)
// ============================================================================

/**
 * Verifica JWT localmente senza chiamare il backend
 * Validazioni:
 * - Signature
 * - Expiration
 * - Issuer
 * - Audience
 * - Claims structure
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // Valida struttura payload
    if (
      !payload.userId ||
      !payload.email ||
      !payload.username ||
      !payload.jti
    ) {
      console.error("❌ JWT: Missing required claims");
      return null;
    }

    return payload as unknown as JWTPayload;
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      console.log("⏰ JWT expired");
    } else if (error instanceof jose.errors.JWTClaimValidationFailed) {
      console.error("❌ JWT claim validation failed:", error.message);
    } else {
      console.error("❌ JWT verification failed:", error);
    }
    return null;
  }
}

// ============================================================================
// Token Expiry Utilities
// ============================================================================

/**
 * Controlla se il token scade tra meno di N millisecondi
 */
export function isTokenExpiringSoon(
  payload: JWTPayload,
  thresholdMs: number = 5 * 60 * 1000 // 5 minuti default
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - now;
  return timeUntilExpiry < thresholdMs / 1000;
}

/**
 * Ottiene il tempo rimanente prima della scadenza in secondi
 */
export function getTimeUntilExpiry(payload: JWTPayload): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}

/**
 * Controlla se il token è già scaduto
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

// ============================================================================
// Cookie Utilities
// ============================================================================

/**
 * Legge un cookie dal browser
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

/**
 * Cancella un cookie (client-side)
 */
export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
