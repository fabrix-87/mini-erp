// lib/server/fingerprint.ts

import { NextRequest } from 'next/server';
import { headers as nextHeaders } from 'next/headers';
import crypto from 'crypto';

// ============================================================================
// Core Fingerprint Logic (Riutilizzabile)
// ============================================================================

/**
 * Genera fingerprint server-side da headers
 * CORE LOGIC - Usata da tutti i contesti
 */
function generateFingerprintFromHeaders(headers: {
  userAgent: string | null;
  acceptLanguage: string | null;
  acceptEncoding: string | null;
  secChUa?: string | null;
  secChUaPlatform?: string | null;
  forwardedFor: string | null;
}): string {
  const components = [
    headers.userAgent || '',
    headers.acceptLanguage || '',
    headers.acceptEncoding || '',
    headers.secChUa || '',
    headers.secChUaPlatform || '',
    headers.forwardedFor || '',
  ].join('|');

  const hash = crypto
    .createHash('sha256')
    .update(components)
    .digest('hex')
    .substring(0, 32);

  return hash;
}

// ============================================================================
// Route Handlers / Middleware Context (NextRequest)
// ============================================================================

/**
 * Estrae fingerprint dagli headers della request (Route Handlers)
 * Se non presente, genera uno basato su headers (fallback)
 * 
 * @param {NextRequest} request - Next.js request object
 * @returns {string} Device fingerprint
 */
export function getFingerprintFromRequest(request: NextRequest): string {
  // Priority 1: Header dal client (più accurato)
  const clientFingerprint = request.headers.get('x-device-fingerprint');
  if (clientFingerprint) {
    return clientFingerprint;
  }

  // Priority 2: Genera server-side come fallback
  console.warn('⚠️ No client fingerprint found, generating server-side fallback');
  
  return generateFingerprintFromHeaders({
    userAgent: request.headers.get('user-agent'),
    acceptLanguage: request.headers.get('accept-language'),
    acceptEncoding: request.headers.get('accept-encoding'),
    secChUa: request.headers.get('sec-ch-ua'),
    secChUaPlatform: request.headers.get('sec-ch-ua-platform'),
    forwardedFor: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip'),
  });
}

// ============================================================================
// Server Components Context (headers() from next/headers)
// ============================================================================

/**
 * Estrae fingerprint per Server Components (SSR)
 * Usa headers() da next/headers invece di NextRequest
 * 
 * @returns {Promise<string>} Device fingerprint
 */
export async function getFingerprintForSSR(): Promise<string> {
  try {
    const headersList = await nextHeaders();
    
    // Priority 1: Check se c'è già fingerprint dal client
    const existingFingerprint = headersList.get('x-device-fingerprint');
    if (existingFingerprint) {
      return existingFingerprint;
    }

    // Priority 2: Genera fingerprint server-side
    return generateFingerprintFromHeaders({
      userAgent: headersList.get('user-agent'),
      acceptLanguage: headersList.get('accept-language'),
      acceptEncoding: headersList.get('accept-encoding'),
      secChUa: headersList.get('sec-ch-ua'),
      secChUaPlatform: headersList.get('sec-ch-ua-platform'),
      forwardedFor: headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip'),
    });
  } catch (error) {
    console.warn('⚠️ Failed to generate SSR fingerprint:', error);
    return 'ssr-fallback';
  }
}

/**
 * Aggiunge fingerprint agli headers per forwarding al backend Express
 * 
 * @param {NextRequest} request - Next.js request object
 * @param {Record<string, string>} headers - Headers esistenti
 * @returns {Record<string, string>} Headers con fingerprint aggiunto
 */
export function addFingerprintHeader(
  request: NextRequest,
  headers: Record<string, string> = {}
): Record<string, string> {
  const fingerprint = getFingerprintFromRequest(request);
  return {
    ...headers,
    'X-Device-Fingerprint': fingerprint,
  };
}

/**
 * Crea headers completi per chiamata a backend Express
 * Include fingerprint, cookies e altri headers necessari
 * 
 * @param {NextRequest} request - Next.js request object
 * @param {Record<string, string>} additionalHeaders - Headers aggiuntivi
 * @returns {Record<string, string>} Headers completi
 */
export function createBackendHeaders(
  request: NextRequest,
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  const fingerprint = getFingerprintFromRequest(request);
  
  // Copia cookies dalla request Next.js
  const cookieHeader = request.headers.get('cookie');
  
  return {
    'Content-Type': 'application/json',
    'X-Device-Fingerprint': fingerprint,
    ...(cookieHeader && { Cookie: cookieHeader }),
    ...additionalHeaders,
  };
}

/**
 * Verifica se il fingerprint è presente nella request
 * Utile per logging/monitoring
 * 
 * @param {NextRequest} request - Next.js request object
 * @returns {boolean} True se fingerprint presente
 */
export function hasFingerprintHeader(request: NextRequest): boolean {
  return !!request.headers.get('x-device-fingerprint');
}

/**
 * Estrae info dispositivo per logging (senza PII)
 * 
 * @param {NextRequest} request - Next.js request object
 * @returns {object} Device info anonimizzate
 */
export function getDeviceInfo(request: NextRequest): {
  hasFingerprint: boolean;
  fingerprintType: 'client' | 'server' | 'unknown';
  userAgent: string;
  platform: string;
  ip: string;
} {
  const fingerprint = request.headers.get('x-device-fingerprint');
  
  return {
    hasFingerprint: !!fingerprint,
    fingerprintType: fingerprint
      ? fingerprint.startsWith('server-') ? 'server' : 'client'
      : 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    platform: request.headers.get('sec-ch-ua-platform') || 'unknown',
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
  };
}
