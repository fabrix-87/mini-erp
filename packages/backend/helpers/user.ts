// helpers/user.ts

import jwt from "jsonwebtoken";
import { TokenPair, UserPayload, SessionData } from "../types/user";
import { Response, Request } from "express";
import crypto from "crypto";
import authConfig from "../config/auth";
import { redisClient, sessionKeys, RedisTTL } from "../config/redis";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/prisma-client";

// ============================================================================
// USER SELECTION
// ============================================================================

/**
 * Selezione standard per query User con relazioni
 */
export const getUserSelection = () => ({
  id: true,
  username: true,
  email: true,
  active: true,
  roles: {
    select: {
      id: true,
      code: true,
      name: true,
      permissions: {
        select: {
          permission: {
            select: {
              id: true,
              code: true,
              description: true,
            },
          },
        },
      },
    },
  },
  details: true,
  preferredLanguageId: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// FINGERPRINTING
// ============================================================================

/**
 * Estrae fingerprint dalla richiesta
 * Se viene da Next.js server, usa l'header X-Device-Fingerprint
 * Se viene direttamente dal browser, lo genera localmente
 */
export const extractFingerprint = (req: Request): string => {
  if (!authConfig.fingerprint.enabled) {
    return "fingerprint-disabled";
  }

  // PRIORITÀ 1: Header X-Device-Fingerprint (da Next.js)
  const headerFingerprint = req.headers["x-device-fingerprint"];
  if (headerFingerprint && typeof headerFingerprint === "string") {
    return headerFingerprint;
  }

  // PRIORITÀ 2: Genera localmente (se chiamata diretta da browser)
  const components = [
    req.headers["user-agent"] || "",
    req.headers["accept-language"] || "",
    req.headers["accept-encoding"] || "",
    req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "",
  ].join("|");

  return crypto
    .createHash(authConfig.fingerprint.algorithm)
    .update(components)
    .digest("hex")
    .substring(0, 32);
};

/**
 * Verifica fingerprint dalla richiesta
 */
export const verifyFingerprint = (
  req: Request,
  tokenFingerprint: string,
): boolean => {
  if (!authConfig.fingerprint.enabled) {
    return true;
  }

  const currentFingerprint = extractFingerprint(req);
  return currentFingerprint === tokenFingerprint;
};

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Genera coppia di token (access + refresh) con JWT claims completi
 */
export const generateTokenPair = (
  user: UserPayload,
  fingerprint: string,
): TokenPair => {
  const jti = uuidv4(); // JWT ID univoco
  const now = Math.floor(Date.now() / 1000);

  // Access Token: contiene tutti i dati utente + claims
  const accessToken = jwt.sign(
    {
      ...user,
      fingerprint,
      jti,
      iat: now,
      iss: authConfig.jwt.issuer,
      aud: authConfig.jwt.audience,
    },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.expiresIn as any },
  );

  // Refresh Token: contiene solo userId + jti
  const refreshTokenId = uuidv4();
  const refreshToken = jwt.sign(
    {
      userId: user.userId,
      fingerprint,
      jti: refreshTokenId,
      type: "refresh",
      iat: now,
      iss: authConfig.jwt.issuer,
      aud: authConfig.jwt.audience,
    },
    authConfig.jwt.refreshSecret,
    { expiresIn: authConfig.jwt.refreshExpiresIn as any },
  );

  return { accessToken, refreshToken, jti, refreshTokenId };
};

// ============================================================================
// SESSION MANAGEMENT (Redis)
// ============================================================================

/**
 * Salva sessione in Redis (atomico)
 */
export const saveSession = async (
  userId: number,
  sessionData: SessionData,
  refreshTokenId: string,
): Promise<void> => {
  const multi = redisClient.multi();

  // 1. Salva dati sessione
  multi.set(sessionKeys.session(userId), JSON.stringify(sessionData), {
    EX: RedisTTL.SESSION,
  });

  // 2. Salva refresh token nella whitelist
  if (authConfig.security.singleRefreshToken) {
    // Sostituisci il vecchio token
    multi.set(sessionKeys.refreshToken(userId), refreshTokenId, {
      EX: RedisTTL.SESSION,
    });
  } else {
    // Aggiungi alla lista (max N token contemporanei)
    multi.lPush(sessionKeys.refreshToken(userId), refreshTokenId);
    multi.lTrim(
      sessionKeys.refreshToken(userId),
      0,
      authConfig.security.maxConcurrentSessions - 1,
    );
    multi.expire(sessionKeys.refreshToken(userId), RedisTTL.SESSION);
  }

  await multi.exec();
};

/**
 * Recupera sessione da Redis
 */
export const getSession = async (
  userId: number,
): Promise<SessionData | null> => {
  try {
    const data = await redisClient.get(sessionKeys.session(userId));
    if (!data) return null;

    const session = JSON.parse(data) as SessionData;
    // Converti stringhe in Date
    session.loginAt = new Date(session.loginAt);
    session.lastActivity = new Date(session.lastActivity);

    return session;
  } catch (error) {
    return null;
  }
};

/**
 * Aggiorna TTL sessione (sliding session)
 */
export const refreshSessionTTL = async (userId: number): Promise<void> => {
  if (!authConfig.session.sliding) return;

  const multi = redisClient.multi();
  multi.expire(sessionKeys.session(userId), RedisTTL.SESSION);
  multi.expire(sessionKeys.refreshToken(userId), RedisTTL.SESSION);

  await multi.exec();
};

/**
 * Aggiorna lastActivity nella sessione
 */
export const updateSessionActivity = async (userId: number): Promise<void> => {
  const session = await getSession(userId);
  if (!session) return;

  session.lastActivity = new Date();

  await redisClient.set(sessionKeys.session(userId), JSON.stringify(session), {
    EX: RedisTTL.SESSION,
    KEEPTTL: true,
  });
};

// ============================================================================
// REFRESH TOKEN MANAGEMENT
// ============================================================================

/**
 * Verifica se refresh token è nella whitelist
 */
export const isRefreshTokenValid = async (
  userId: number,
  refreshTokenId: string,
): Promise<boolean> => {
  try {
    if (authConfig.security.singleRefreshToken) {
      const storedId = await redisClient.get(sessionKeys.refreshToken(userId));
      return storedId === refreshTokenId;
    } else {
      const tokens = await redisClient.lRange(
        sessionKeys.refreshToken(userId),
        0,
        -1,
      );
      return tokens.includes(refreshTokenId);
    }
  } catch (error) {
    return false;
  }
};

/**
 * Recupera refreshTokenId dalla whitelist (helper per aggiornamenti)
 */
export const getRefreshTokenId = async (
  userId: number,
): Promise<string | null> => {
  try {
    if (authConfig.security.singleRefreshToken) {
      return await redisClient.get(sessionKeys.refreshToken(userId));
    } else {
      const tokens = await redisClient.lRange(
        sessionKeys.refreshToken(userId),
        0,
        0,
      );
      return tokens[0] || null;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Ruota refresh token (invalida il vecchio, genera nuovo)
 */
export const rotateRefreshToken = async (
  userId: number,
  oldRefreshTokenId: string,
  newRefreshTokenId: string,
): Promise<void> => {
  const multi = redisClient.multi();

  if (authConfig.security.singleRefreshToken) {
    // Sostituisci direttamente
    multi.set(sessionKeys.refreshToken(userId), newRefreshTokenId, {
      EX: RedisTTL.SESSION,
    });
  } else {
    // Rimuovi vecchio, aggiungi nuovo
    multi.lRem(sessionKeys.refreshToken(userId), 1, oldRefreshTokenId);
    multi.lPush(sessionKeys.refreshToken(userId), newRefreshTokenId);
    multi.expire(sessionKeys.refreshToken(userId), RedisTTL.SESSION);
  }

  await multi.exec();
};

// ============================================================================
// TOKEN BLACKLIST
// ============================================================================

/**
 * Aggiungi JTI alla blacklist (per logout)
 */
export const blacklistToken = async (
  jti: string,
  expiresInSeconds: number,
): Promise<void> => {
  await redisClient.set(sessionKeys.blacklist(jti), "blacklisted", {
    EX: expiresInSeconds,
  });
};

/**
 * Verifica se JTI è nella blacklist
 */
export const isTokenBlacklisted = async (jti: string): Promise<boolean> => {
  const result = await redisClient.get(sessionKeys.blacklist(jti));
  return result !== null;
};

// ============================================================================
// SESSION DESTRUCTION
// ============================================================================

/**
 * Distruggi sessione completa (logout)
 */
export const destroySession = async (
  userId: number,
  jti: string,
  ttl: number,
): Promise<void> => {
  const multi = redisClient.multi();

  // 1. Rimuovi sessione
  multi.del(sessionKeys.session(userId));

  // 2. Rimuovi refresh token(s)
  multi.del(sessionKeys.refreshToken(userId));

  // 3. Aggiungi access token jti alla blacklist (se fornito)
  if (jti) {
    multi.set(sessionKeys.blacklist(jti), "blacklisted", { EX: ttl });
  }

  // 4. Invalida cache permessi
  multi.del(sessionKeys.permissions(userId));

  await multi.exec();
};

/**
 * Distruggi tutte le sessioni di un utente (es. dopo reset password)
 */
export const destroyAllUserSessions = async (userId: number): Promise<void> => {
  const multi = redisClient.multi();

  multi.del(sessionKeys.session(userId));
  multi.del(sessionKeys.refreshToken(userId));
  multi.del(sessionKeys.permissions(userId));

  await multi.exec();
};

// ============================================================================
// PERMISSIONS CACHE (Redis)
// ============================================================================

/**
 * Recupera permessi utente da cache Redis
 * Se non in cache, li recupera dal DB e li salva
 */
export const getUserPermissions = async (userId: number): Promise<string[]> => {
  // 1. Prova a recuperare da cache
  const cached = await redisClient.get(sessionKeys.permissions(userId));

  if (cached) {
    return JSON.parse(cached) as string[];
  }

  // 2. Se non in cache, recupera dal DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      roles: {
        select: {
          permissions: {
            select: {
              permission: {
                select: { code: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return [];
  }

  // 3. Appiattisci la struttura
  const permissions = new Set<string>();
  user.roles.forEach((role) => {
    role.permissions.forEach((rp) => {
      if (rp.permission?.code) {
        permissions.add(rp.permission.code);
      }
    });
  });

  const permissionArray = Array.from(permissions);

  // 4. Salva in cache con TTL
  await redisClient.set(
    sessionKeys.permissions(userId),
    JSON.stringify(permissionArray),
    { EX: RedisTTL.PERMISSIONS },
  );

  return permissionArray;
};

/**
 * Invalida cache permessi utente (chiamare dopo modifica ruoli)
 */
export const invalidateUserPermissionsCache = async (
  userId: number,
): Promise<void> => {
  await redisClient.del(sessionKeys.permissions(userId));
};

/**
 * Verifica se un utente ha uno dei permessi richiesti (con cache)
 */
export const hasPermission = async (
  userId: number,
  requiredPermissions: string[],
): Promise<boolean> => {
  const userPermissions = await getUserPermissions(userId);
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
};

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

/**
 * Imposta cookie sicuri per i token
 */
export const setTokenCookies = (res: Response, tokens: TokenPair) => {
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: authConfig.isProduction ? "strict" : "lax",
    maxAge: authConfig.jwt.expiresInMs,
    path: "/",
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: authConfig.isProduction ? "strict" : "lax",
    maxAge: authConfig.jwt.refreshExpiresInMs,
    path: "/",
  });
};

/**
 * Rimuove i cookie dei token (per logout)
 */
export const clearTokenCookies = (res: Response) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

type RoleWithPermissions = {
  id: number;
  code: string;
  name: string;
  permissions: {
    permission: {
      id: number;
      code: string;
      description: string | null;
    };
  }[];
};

type RoleDTO = {
  id: number;
  code: string;
  name: string;
  permissions: string[];
};

/**
 * Formatta i ruoli per la risposta, estraendo i permessi dalla struttura annidata
 */
export const formatUserRoles = (roles: RoleWithPermissions[]): RoleDTO[] => {
  return roles.map((role) => ({
    id: role.id,
    code: role.code,
    name: role.name,
    permissions: role.permissions.map((rp) => rp.permission.code),
  }));
};

/**
 * Genera token di reset password sicuro
 * @returns token (da inviare via email), hashedToken (da salvare su DB), expiresAt
 */
export function generateResetToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  // 1. Genera token random (32 bytes = 64 caratteri hex)
  const token = crypto.randomBytes(32).toString("hex");

  // 2. Hash con SHA-256 (64 caratteri hex output)
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 3. Scadenza (1 ora)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  return { token, hashedToken, expiresAt };
}

/**
 * Genera token di verifica email
 */
export function generateEmailVerificationToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Email verification: 24 ore
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return { token, hashedToken, expiresAt };
}

/**
 * Verifica se account è bloccato per troppi tentativi
 */
export function isAccountLocked(user: {
  lockedUntil: Date | null;
  failedLoginAttempts: number;
}): boolean {
  if (!user.lockedUntil) return false;

  return user.lockedUntil > new Date();
}

/**
 * Calcola quando sbloccare account (exponential backoff)
 */
export function calculateLockUntil(failedAttempts: number): Date {
  // 5 tentativi = 5 min, 10 = 30 min, 15 = 2 ore
  const minutes = Math.min(Math.pow(2, failedAttempts - 5), 120);
  return new Date(Date.now() + minutes * 60 * 1000);
}
