// middleware/auth-middleware.ts
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/app-error-utils";
import type { UserPayload } from "../types/user-types";
import authConfig from "../config/auth-config";
import type { AppBindings } from "../lib/hono-app";
import {
  verifyFingerprint,
  isTokenBlacklisted,
  getSession,
  refreshSessionTTL,
  updateSessionActivity,
  hasPermission,
} from "../helpers/user-helper";
import { sendAuthenticationError, sendFail } from "@/utils/response-utils";

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Full authentication middleware with:
 * - JWT signature verification
 * - Blacklist check (jti)
 * - Redis session validation
 * - Device fingerprint verification
 * - Standard JWT claims validation (iss, aud)
 *
 * @example
 * app.get("/protected", authenticateToken, handler);
 */
export const authenticateToken = createMiddleware<AppBindings>(async (c, next) => {
  // 1. Leggi access token dal cookie
  const token = getCookie(c, "accessToken");

  if (!token) {
    return sendAuthenticationError(c, "Token di autenticazione mancante");
  }

  // 2. Verifica firma JWT + exp
  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendAuthenticationError(c, "Token scaduto");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return sendAuthenticationError(c, "Token non valido");
    }
    throw error;
  }

  // 3. Valida claims standard
  if (decoded.iss !== authConfig.jwt.issuer) {
    return sendAuthenticationError(c, "Issuer non valido");
  }
  if (decoded.aud !== authConfig.jwt.audience) {
    return sendAuthenticationError(c, "Audience non valido");
  }

  // 4. Verifica blacklist (logout)
  if (decoded.jti && (await isTokenBlacklisted(decoded.jti))) {
    return sendAuthenticationError(c, "Token revocato");
  }

  // 5. Verifica fingerprint (previene token theft)
  if (decoded.fingerprint && !verifyFingerprint(c, decoded.fingerprint)) {
    return sendAuthenticationError(c, "Fingerprint non valido - possibile furto token");
  }

  // 6. Verifica sessione attiva in Redis
  const session = await getSession(decoded.userId);
  if (!session) {
    return sendAuthenticationError(c, "Sessione non valida o scaduta");
  }

  // 7. Sliding session: aggiorna TTL se configurato
  await refreshSessionTTL(decoded.userId);

  // 8. Aggiorna lastActivity
  await updateSessionActivity(decoded.userId);

  // 9. Popola il context Hono
  c.set("user", decoded as UserPayload);
  c.set("jwtPayload", {
    sub: String(decoded.userId),
    email: decoded.email,
    type: "access",
    jti: decoded.jti,
    exp: decoded.exp,
    iat: decoded.iat,
  });

  await next();
});

// ============================================================================
// LIGHTWEIGHT AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Lightweight authentication middleware for edge-compatible contexts.
 * Only verifies JWT signature and base claims — does NOT check Redis.
 *
 * ⚠️ Does NOT verify:
 * - Blacklist
 * - Redis session
 * Must be followed by full validation in the route handler if needed.
 *
 * @example
 * app.get("/lightweight", authenticateTokenLightweight, handler);
 */
export const authenticateTokenLightweight = createMiddleware<AppBindings>(async (c, next) => {
  const token = getCookie(c, "accessToken");

  if (!token) {
    return sendAuthenticationError(c, "Token di autenticazione mancante");
  }

  let decoded: UserPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendAuthenticationError(c, "Token scaduto");
    }
    return sendAuthenticationError(c, "Token non valido");
  }

  if (decoded.iss !== authConfig.jwt.issuer || decoded.aud !== authConfig.jwt.audience) {
    return sendAuthenticationError(c, "Claims non validi");
  }

  c.set("user", decoded);
  await next();
});

// ============================================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Permission-based authorization middleware with Redis cache.
 * Verifies that the authenticated user has at least one of the required permissions.
 *
 * @param requiredPermissions - Array of permission codes required (e.g. ["user:read", "user:manage"])
 *
 * @example
 * app.get("/admin", authenticateToken, authorize(["admin:access"]), handler);
 * app.put("/users/:id", authenticateToken, authorize(["user:update", "user:manage"]), handler);
 */
export const authorize = (requiredPermissions: string[]) => {
  return createMiddleware<AppBindings>(async (c, next) => {
    const user = c.get("user");

    if (!user || !user.userId) {
      return sendAuthenticationError(c);
    }

    const hasRequiredPermission = await hasPermission(user.userId, requiredPermissions);

    if (!hasRequiredPermission) {
      return sendFail(c, {
        statusCode: 403,
        message: `Non hai i permessi necessari. Richiesti: [${requiredPermissions.join(", ")}]`,
      });
    }

    await next();
  });
};

// ============================================================================
// ROLE MIDDLEWARE
// ============================================================================

/**
 * Role-based authorization middleware.
 * Verifies that the authenticated user has at least one of the required roles.
 *
 * @param requiredRoles - Array of role codes required (e.g. ["ADMIN", "MANAGER"])
 *
 * @example
 * app.get("/admin", authenticateToken, requireRole(["ADMIN"]), handler);
 */
export const requireRole = (requiredRoles: string[]) => {
  return createMiddleware<AppBindings>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return sendAuthenticationError(c);
    }

    const userRoleCodes = user.roles.map((role) => role.code);
    const hasRole = requiredRoles.some((role) => userRoleCodes.includes(role));

    if (!hasRole) {
      return sendFail(c, {
        statusCode: 403,
        message: `Questa operazione richiede uno dei seguenti ruoli: ${requiredRoles.join(", ")}`,
      });
    }

    await next();
  });
};

// ============================================================================
// SELF OR ADMIN MIDDLEWARE
// ============================================================================

/**
 * Ensures that the user is either accessing their own resource or is an admin.
 *
 * @param paramName - The route parameter name containing the resource owner ID (default: "id")
 *
 * @example
 * app.put("/users/:id", authenticateToken, requireSelfOrAdmin(), handler);
 */
export const requireSelfOrAdmin = (paramName: string = "id") => {
  return createMiddleware<AppBindings>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return sendAuthenticationError(c);
    }

    const resourceId = parseInt(c.req.param(paramName) ?? '', 10);

    if (resourceId === user.userId) {
      return await next();
    }

    const isAdmin = user.roles.some((role) => role.code === "ADMIN" || role.code === "user:manage");

    if (isAdmin) {
      return await next();
    }
    return sendFail(c, {
      statusCode: 403,
      message: "Puoi accedere solo alle tue risorse",
    });
  });
};

// ============================================================================
// OPTIONAL AUTH MIDDLEWARE
// ============================================================================

/**
 * Optional authentication middleware.
 * Populates context user if a valid token is present, but never blocks the request.
 *
 * @example
 * app.get("/public", optionalAuth, handler);
 */
export const optionalAuth = createMiddleware<AppBindings>(async (c, next) => {
  const token = getCookie(c, "accessToken");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

      if (decoded.iss === authConfig.jwt.issuer && decoded.aud === authConfig.jwt.audience) {
        c.set("user", decoded);
      }
    } catch {
      // Silent fail — optional auth never blocks
    }
  }

  await next();
});
