// lib/jwt.ts
import { JWTPayload, User } from "@/types/api";
import * as jose from "jose";

// ============================================================================
// JWT Configuration
// ============================================================================

/**
 * Decodifica JWT senza verificare la firma (solo per leggere i dati)
 * ⚠️ Non validare, usare solo per debug o analisi non critiche
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const decoded = jose.decodeJwt(token);
    
    if (
      !decoded.userId ||
      !decoded.email ||
      !decoded.username ||
      !decoded.jti
    ) {
      console.error("❌ JWT: Missing required claims");
      return null;
    }

    return decoded as unknown as JWTPayload;
  } catch (error) {
    console.error("❌ Failed to decode JWT:", error);
    return null;
  }
}

// ============================================================================
// User Data from Cookie (Primary Method)
// ============================================================================

/**
 * Ottiene i dati utente dal cookie 'user'
 * ✅ Metodo principale per l'AuthProvider
 */
export function getUserFromUserCookie(): User | null {
  const userCookie = getCookie('user');
  if (!userCookie) return null;

  try {
    // ✅ Decodifica URL encoding prima di parsare JSON
    const decodedCookie = decodeURIComponent(userCookie);
    return JSON.parse(decodedCookie) as User;
  } catch (error) {
    console.error('Failed to parse user cookie:', error);
    console.error('Cookie value:', userCookie);
    return null;
  }
}

/**
 * Verifica se l'utente è autenticato controllando il cookie 'user'
 * ✅ Metodo veloce per l'AuthProvider
 */
export function isAuthenticated(): boolean {
  return getUserFromUserCookie() !== null;
}

// ============================================================================
// Role-Based Access Control (RBAC)
// ============================================================================

/**
 * Ottiene i dati utente corrente per controlli RBAC
 */
export function getCurrentUser(): User | null {
  return getUserFromUserCookie();
}

/**
 * Controlla se l'utente ha un ruolo specifico
 */
export function hasRole(roleCode: string): boolean {
  const user = getCurrentUser();
  if (!user || !user.roles) return false;
  
  return user.roles.some(role => role.code === roleCode);
}

/**
 * Controlla se l'utente ha almeno uno dei ruoli specificati
 */
export function hasAnyRole(roleCodes: string[]): boolean {
  const user = getCurrentUser();
  if (!user || !user.roles) return false;
  
  return user.roles.some(role => roleCodes.includes(role.code));
}

/**
 * Controlla se l'utente ha tutti i ruoli specificati
 */
export function hasAllRoles(roleCodes: string[]): boolean {
  const user = getCurrentUser();
  if (!user || !user.roles) return false;
  
  return roleCodes.every(code => 
    user.roles!.some(role => role.code === code)
  );
}

/**
 * Ottiene i codici dei ruoli dell'utente corrente
 */
export function getUserRoleCodes(): string[] {
  const user = getCurrentUser();
  if (!user || !user.roles) return [];
  
  return user.roles.map(role => role.code);
}

// ============================================================================
// Token Expiry Utilities (per uso avanzato)
// ============================================================================

/**
 * Controlla se il token scade tra meno di N millisecondi
 * ⚠️ Richiede il payload JWT - usare solo per refresh token logic
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
