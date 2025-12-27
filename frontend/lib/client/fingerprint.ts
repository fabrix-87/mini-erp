// lib/client/fingerprint.ts

import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fingerprintPromise: Promise<string> | null = null;

const FINGERPRINT_STORAGE_KEY = 'device-fingerprint';
const FINGERPRINT_TIMESTAMP_KEY = 'device-fingerprint-timestamp';
const FINGERPRINT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 giorni

/**
 * Genera un fingerprint univoco del browser usando FingerprintJS
 * Include caching per performance e persistence in sessionStorage
 * 
 * @returns {Promise<string>} Fingerprint univoco del dispositivo
 */
export async function getBrowserFingerprint(): Promise<string> {
  // ✅ GUARD: Se eseguito sul server, ritorna placeholder
  if (typeof window === 'undefined') {
    console.warn('⚠️ getBrowserFingerprint called on server-side, returning placeholder');
    return 'server-side-placeholder';
  }

  console.debug('##########################');

  // 1. Check cache in-memory (più veloce)
  if (fingerprintPromise) {
    return fingerprintPromise;
  }

  fingerprintPromise = (async () => {
    try {
      // 2. Check sessionStorage (persiste durante la sessione browser)
      const stored = getStoredFingerprint();
      if (stored) {
        return stored;
      }

      // 3. Genera nuovo fingerprint con FingerprintJS (più accurato)
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;

      // 4. Salva in sessionStorage per riuso
      storeFingerprint(fingerprint);
      return fingerprint;
    } catch (error) {
      console.error("❌ Failed to generate fingerprint with FingerprintJS:", error);
      // Fallback: genera fingerprint semplice (meno accurato ma funzionale)
      const fallbackFingerprint = generateFallbackFingerprint();
      storeFingerprint(fallbackFingerprint);
      return fallbackFingerprint;
    }
  })();

  return fingerprintPromise;
}

/**
 * Recupera fingerprint da sessionStorage se valido
 */
function getStoredFingerprint(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(FINGERPRINT_STORAGE_KEY);
    const timestamp = sessionStorage.getItem(FINGERPRINT_TIMESTAMP_KEY);

    if (!stored || !timestamp) return null;

    // Verifica se è ancora valido (entro TTL)
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > FINGERPRINT_TTL) {
      // Expired, rimuovi
      sessionStorage.removeItem(FINGERPRINT_STORAGE_KEY);
      sessionStorage.removeItem(FINGERPRINT_TIMESTAMP_KEY);
      return null;
    }

    return stored;
  } catch (error) {
    console.warn('Failed to read fingerprint from storage:', error);
    return null;
  }
}

/**
 * Salva fingerprint in sessionStorage
 */
function storeFingerprint(fingerprint: string): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(FINGERPRINT_STORAGE_KEY, fingerprint);
    sessionStorage.setItem(FINGERPRINT_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to store fingerprint:', error);
  }
}

/**
 * Genera fingerprint fallback (quando FingerprintJS fallisce)
 * Meno accurato ma comunque utile per tracking base
 */
function generateFallbackFingerprint(): string {
  // ✅ GUARD: Se sul server, ritorna placeholder
  if (typeof window === 'undefined') {
    return 'fallback-server-placeholder';
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    // Canvas fingerprint semplice
    getSimpleCanvasFingerprint(),
  ].join('|');

  // Hash semplice
  return `fallback-${hashString(components)}`;
}

/**
 * Canvas fingerprint semplice per fallback
 */
function getSimpleCanvasFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    return canvas.toDataURL().substring(0, 50);
  } catch {
    return '';
  }
}

/**
 * Hash semplice per fallback
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 16);
}

/**
 * Reset cache fingerprint (utile per testing o dopo logout)
 */
export function resetFingerprint(): void {
  fingerprintPromise = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(FINGERPRINT_STORAGE_KEY);
      sessionStorage.removeItem(FINGERPRINT_TIMESTAMP_KEY);
    } catch (error) {
      console.warn('Failed to reset fingerprint:', error);
    }
  }
}

/**
 * Aggiunge fingerprint agli headers di una richiesta
 * Header name: 'X-Device-Fingerprint'
 * 
 * @param {Record<string, string>} headers - Headers esistenti
 * @returns {Promise<Record<string, string>>} Headers con fingerprint aggiunto
 */
export async function addFingerprintHeader(
  headers: Record<string, string> = {}
): Promise<Record<string, string>> {
  // ✅ GUARD: Se sul server, ritorna headers senza fingerprint
  if (typeof window === 'undefined') {
    console.debug('⚠️ addFingerprintHeader called on server-side, skipping');
    return headers;
  }

  const fingerprint = await getBrowserFingerprint();
  return {
    ...headers,
    'X-Device-Fingerprint': fingerprint,
  };
}

/**
 * Verifica se il fingerprint è disponibile e valido
 * Utile per UI loading states
 */
export function isFingerprintReady(): boolean {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem(FINGERPRINT_STORAGE_KEY);
}

/**
 * Pre-load fingerprint (chiamare all'avvio app per performance)
 * Non blocca, genera in background
 */
export function preloadFingerprint(): void {
  if (typeof window === 'undefined') return;
  
  getBrowserFingerprint().catch(err => {
    console.warn('Fingerprint preload failed:', err);
  });
}
