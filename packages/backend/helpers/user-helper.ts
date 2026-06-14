// helpers/user-helper.ts

import jwt from "jsonwebtoken";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";
import { TokenPair, UserPayload, SessionData } from "../types/user-types";
import crypto from "crypto";
import authConfig from "../config/auth-config";
import { redisClient, sessionKeys, RedisTTL } from "../config/redis-config";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/prisma-config";
import type { AppBindings } from "../lib/hono-app";
import { Prisma } from "@/generated/prisma/client";
import { UserMembershipStatus } from "@mini-erp/shared";
import { getPermissionsFromMembership, getRolesFromMembership } from "./user-membership-helper";

// ============================================================================
// USER SELECTION
// ============================================================================

/**
 * Returns the standard Prisma user selection with roles and permissions.
 */
export const getUserSelection = () =>
  ({
    id: true,
    username: true,
    email: true,
    active: true,
    preferredLanguageId: true,
    details: {
      select: {
        firstName: true,
        lastName: true,
      },
    },
    memberships: {
      where: { status: "ACTIVE" },
      select: {
        id: true,
        tenantId: true,
        status: true,
        isDefault: true,
        tenant: {
          select: {
            code: true,
            company: {
              select: {
                companyName: true,
              },
            },
          },
        },
        roles: {
          select: {
            role: {
              select: {
                id: true,
                code: true,
                name: true,
                permissions: {
                  select: {
                    permission: { select: { code: true } },
                  },
                },
              },
            },
          },
        },
      },
    },
    createdAt: true,
    updatedAt: true,
  }) satisfies Prisma.UserSelect;

// ============================================================================
// FINGERPRINTING
// ============================================================================

/**
 * Extracts the device fingerprint from Hono context headers.
 * Priority: X-Device-Fingerprint header > locally generated hash.
 */
export const extractFingerprint = (c: Context<AppBindings>): string => {
  if (!authConfig.fingerprint.enabled) {
    return "fingerprint-disabled";
  }

  const headerFingerprint = c.req.header("x-device-fingerprint");
  if (headerFingerprint) {
    return headerFingerprint;
  }

  const components = [
    c.req.header("user-agent") || "",
    c.req.header("accept-language") || "",
    c.req.header("accept-encoding") || "",
    c.req.header("x-forwarded-for") || "",
  ].join("|");

  return crypto
    .createHash(authConfig.fingerprint.algorithm)
    .update(components)
    .digest("hex")
    .substring(0, 32);
};

/**
 * Verifies that the request fingerprint matches the one stored in the token.
 */
export const verifyFingerprint = (c: Context<AppBindings>, tokenFingerprint: string): boolean => {
  if (!authConfig.fingerprint.enabled) return true;
  return extractFingerprint(c) === tokenFingerprint;
};

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generates a signed access + refresh token pair for the given user.
 */
export const generateTokenPair = (user: UserPayload, fingerprint: string): TokenPair => {
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
 * Saves the user session and refresh token to Redis atomically.
 */
export const saveSession = async (
  userId: string,
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
    multi.lTrim(sessionKeys.refreshToken(userId), 0, authConfig.security.maxConcurrentSessions - 1);
    multi.expire(sessionKeys.refreshToken(userId), RedisTTL.SESSION);
  }

  await multi.exec();
};

/**
 * Retrieves a user session from Redis.
 */
export const getSession = async (userId: string): Promise<SessionData | null> => {
  try {
    const data = await redisClient.get(sessionKeys.session(userId));
    if (!data) return null;

    return JSON.parse(data) as SessionData;
  } catch (error) {
    return null;
  }
};

/**
 * Extends session and refresh token TTL (sliding session).
 */
export const refreshSessionTTL = async (userId: string): Promise<void> => {
  if (!authConfig.session.sliding) return;

  const multi = redisClient.multi();
  multi.expire(sessionKeys.session(userId), RedisTTL.SESSION);
  multi.expire(sessionKeys.refreshToken(userId), RedisTTL.SESSION);

  await multi.exec();
};

/**
 * Updates the lastActivity timestamp in the session.
 */
export const updateSessionActivity = async (userId: string): Promise<void> => {
  const session = await getSession(userId);
  if (!session) return;

  session.lastActivity = new Date().toISOString();

  await redisClient.set(sessionKeys.session(userId), JSON.stringify(session), {
    EX: RedisTTL.SESSION,
    KEEPTTL: true,
  });
};

// ============================================================================
// REFRESH TOKEN MANAGEMENT
// ============================================================================

/**
 * Checks whether the given refresh token ID is still valid in Redis.
 */
export const isRefreshTokenValid = async (
  userId: string,
  refreshTokenId: string,
): Promise<boolean> => {
  try {
    if (authConfig.security.singleRefreshToken) {
      const storedId = await redisClient.get(sessionKeys.refreshToken(userId));
      return storedId === refreshTokenId;
    } else {
      const tokens = await redisClient.lRange(sessionKeys.refreshToken(userId), 0, -1);
      return tokens.includes(refreshTokenId);
    }
  } catch (error) {
    return false;
  }
};

/**
 * Retrieves the current refresh token ID for the user from Redis.
 */
export const getRefreshTokenId = async (userId: string): Promise<string | null> => {
  try {
    if (authConfig.security.singleRefreshToken) {
      return await redisClient.get(sessionKeys.refreshToken(userId));
    } else {
      const tokens = await redisClient.lRange(sessionKeys.refreshToken(userId), 0, 0);
      return tokens[0] || null;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Rotates the refresh token by replacing the old ID with a new one.
 */
export const rotateRefreshToken = async (
  userId: string,
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
 * Adds a token JTI to the Redis blacklist.
 */
export const blacklistToken = async (jti: string, expiresInSeconds: number): Promise<void> => {
  await redisClient.set(sessionKeys.blacklist(jti), "blacklisted", {
    EX: expiresInSeconds,
  });
};

/**
 * Returns true if the given JTI is blacklisted (token was revoked).
 */
export const isTokenBlacklisted = async (jti: string): Promise<boolean> => {
  const result = await redisClient.get(sessionKeys.blacklist(jti));
  return result !== null;
};

// ============================================================================
// SESSION DESTRUCTION
// ============================================================================

/**
 * Destroys the full user session and blacklists the current access token.
 */
export const destroySession = async (userId: string, jti: string, ttl: number): Promise<void> => {
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
 * Destroys all active sessions for a user (e.g. after password reset).
 */
export const destroyAllUserSessions = async (userId: string): Promise<void> => {
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
 * Returns the user's permission codes from Redis cache or database.
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const cached = await redisClient.get(sessionKeys.permissions(userId));
  if (cached) return JSON.parse(cached) as string[];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      memberships: {
        where: { status: "ACTIVE" },
        select: {
          roles: {
            select: {
              role: {
                select: { permissions: { select: { permission: { select: { code: true } } } } },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return [];

  const permissions = new Set<string>();
  for (const membership of user.memberships) {
    for (const mr of membership.roles) {
      for (const rp of mr.role.permissions) {
        if (rp.permission?.code) permissions.add(rp.permission.code);
      }
    }
  }

  const permissionArray = Array.from(permissions);
  await redisClient.set(sessionKeys.permissions(userId), JSON.stringify(permissionArray), {
    EX: RedisTTL.PERMISSIONS,
  });
  return permissionArray;
};

/**
 * Invalidates the cached permissions for a user (call after role changes).
 */
export const invalidateUserPermissionsCache = async (userId: string): Promise<void> => {
  await redisClient.del(sessionKeys.permissions(userId));
};

/**
 * Returns true if the user has at least one of the required permissions.
 */
export const hasPermission = async (
  userId: string,
  requiredPermissions: string[],
): Promise<boolean> => {
  const userPermissions = await getUserPermissions(userId);
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
};

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

/**
 * Sets the access and refresh token cookies in the Hono response.
 */
export const setTokenCookies = (c: Context<AppBindings>, tokens: TokenPair): void => {
  const cookieBase = {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: (authConfig.isProduction ? "strict" : "lax") as "strict" | "lax",
    path: "/",
  };

  setCookie(c, "accessToken", tokens.accessToken, {
    ...cookieBase,
    maxAge: authConfig.jwt.expiresInMs / 1000,
  });

  setCookie(c, "refreshToken", tokens.refreshToken, {
    ...cookieBase,
    maxAge: authConfig.jwt.refreshExpiresInMs / 1000,
  });
};

/**
 * Clears the access and refresh token cookies (logout).
 */
export const clearTokenCookies = (c: Context<AppBindings>): void => {
  const cookieBase = {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: (authConfig.isProduction ? "strict" : "lax") as "strict" | "lax",
    path: "/",
    maxAge: 0,
  };

  deleteCookie(c, "accessToken", cookieBase);
  deleteCookie(c, "refreshToken", cookieBase);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const mapUserResponse = <
  T extends {
    id: string;
    username: string;
    email: string;
    active: boolean;
    preferredLanguageId: number | null;
    details: unknown;
    createdAt: Date;
    updatedAt: Date;
    memberships: Array<{
      id: string;
      tenantId: string;
      status: UserMembershipStatus;
      isDefault: boolean;
      tenant: {
        code: string;
        company: {
          companyName: string;
        };
      };
      roles: Array<{
        role: {
          id: number;
          code: string;
          name: string;
          permissions: Array<{
            permission: { code: string };
          }>;
        };
      }>;
    }>;
  },
>(
  user: T,
  currentTenantId?: string,
) => {
  const currentMembership =
    (currentTenantId
      ? user.memberships.find((membership) => membership.tenantId === currentTenantId)
      : undefined) ??
    user.memberships.find((membership) => membership.isDefault) ??
    user.memberships.find((membership) => membership.status === "ACTIVE") ??
    null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    active: user.active,
    preferredLanguageId: user.preferredLanguageId,
    details: user.details,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,

    currentTenant: currentMembership
      ? {
          tenantId: currentMembership.tenantId,
          membershipId: currentMembership.id,
          name: currentMembership.tenant.company.companyName,
          code: currentMembership.tenant.code,
          isDefault: currentMembership.isDefault,
          status: currentMembership.status,
          roles: getRolesFromMembership(currentMembership),
          permissions: getPermissionsFromMembership(currentMembership),
        }
      : null,

    availableTenants: user.memberships.map((membership) => ({
      tenantId: membership.tenantId,
      membershipId: membership.id,
      name: membership.tenant.company.companyName,
      code: membership.tenant.code,
      isDefault: membership.isDefault,
      status: membership.status,
      roles: getRolesFromMembership(membership),
    })),
  };
};

/**
 * Generates a secure reset token with its hashed counterpart and expiry.
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
 * Generates a secure email verification token with expiry.
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
 * Returns true if the account is currently locked.
 */
export function isAccountLocked(user: {
  lockedUntil: Date | null;
  failedLoginAttempts: number;
}): boolean {
  if (!user.lockedUntil) return false;

  return user.lockedUntil > new Date();
}

/**
 * Calculates the lock expiry time using exponential backoff.
 */
export function calculateLockUntil(failedAttempts: number): Date {
  // 5 tentativi = 5 min, 10 = 30 min, 15 = 2 ore
  const minutes = Math.min(Math.pow(2, failedAttempts - 5), 120);
  return new Date(Date.now() + minutes * 60 * 1000);
}
