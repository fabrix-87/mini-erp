// lib/constants/auth.ts

/**
 * Durata access token in SECONDI (usato per maxAge cookie)
 */
export const ACCESS_TOKEN_LIFETIME_SECONDS = 15 * 60; // 15 minuti

/**
 * Durata access token in MILLISECONDI (usato per JavaScript timer)
 */
export const ACCESS_TOKEN_LIFETIME_MS = ACCESS_TOKEN_LIFETIME_SECONDS * 1000;

/**
 * Durata refresh token in SECONDI
 */
export const REFRESH_TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7; // 7 giorni

/**
 * Quanto tempo prima della scadenza iniziare il refresh proattivo (in MS)
 */
export const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // 2 minuti

/**
 * Intervallo di controllo del token (in MS)
 */
export const TOKEN_CHECK_INTERVAL_MS = 60 * 1000; // 1 minuto
