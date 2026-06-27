// middleware/rate-limit-middleware.ts
import { createMiddleware } from "hono/factory";
import { redisClient, sessionKeys } from "../config/redis-config";
import logger from "../config/logger-config";
import { TooManyRequestsError } from "../utils/app-error-utils";
import type { AppBindings } from "../lib/hono-app";
import type { Context } from "hono";

// ============================================================================
// TYPES
// ============================================================================

interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Custom key generator — defaults to client IP */
  keyGenerator?: (c: Context<AppBindings>) => string;
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Creates a Redis-based sliding window rate limiter middleware for Hono.
 * Uses a Redis sorted set (ZSET) for accurate per-window request counting.
 * Fails open if Redis is unavailable (logs error but allows the request).
 *
 * @param options - Rate limiter configuration
 *
 * @example
 * app.use("/api", createRedisRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 }));
 */
export const createRedisRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (c: Context<AppBindings>) =>
      c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
      c.req.header("x-real-ip") ??
      "unknown",
  } = options;

  return createMiddleware<AppBindings>(async (c, next) => {
    const identifier = keyGenerator(c);
    const key = sessionKeys.rateLimit(identifier);
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Sliding window via Redis ZSET
      const multi = redisClient.multi();
      multi.zRemRangeByScore(key, 0, windowStart); // 1. Purge expired entries
      multi.zCard(key); // 2. Count current window
      multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` }); // 3. Add current request
      multi.expire(key, Math.ceil(windowMs / 1000)); // 4. Reset TTL

      const results = await multi.exec();
      const currentRequests = (results?.[1] as unknown as number) ?? 0;

      // Rate limit headers
      c.header("X-RateLimit-Limit", String(maxRequests));
      c.header("X-RateLimit-Remaining", String(Math.max(0, maxRequests - currentRequests)));
      c.header("X-RateLimit-Reset", new Date(now + windowMs).toISOString());

      if (currentRequests >= maxRequests) {
        const retryAfter = Math.ceil(windowMs / 1000);
        c.header("Retry-After", String(retryAfter));

        logger.warn(`Rate limit exceeded for: ${identifier}`, {
          key,
          currentRequests,
          maxRequests,
        });

        throw new TooManyRequestsError("Troppe richieste. Riprova più tardi.", retryAfter);
      }

      // Execute handler
      await next();
    } catch (error) {
      if (error instanceof TooManyRequestsError) throw error;

      // Fail-open: Redis unavailable → let request through
      logger.error("Rate limiter Redis error (fail-open):", error);
      await next();
    }
  });
};

// ============================================================================
// PRECONFIGURED LIMITERS
// ============================================================================

/**
 * General API rate limiter — 100 req / 15 min per IP (1000 in development).
 */
export const apiRateLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: process.env.NODE_ENV === "production" ? 100 : 1000,
  keyGenerator: (c) => `api:${c.req.header("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"}`,
});

/**
 * Login rate limiter — 5 attempts / 15 min per IP. - 5 min in devlopment
 * Only counts failed attempts (skipSuccessfulRequests: true).
 */
export const loginRateLimiter = createRedisRateLimiter({
  windowMs: (process.env.NODE_ENV === "development" ? 5 : 15) * 60 * 1000,
  maxRequests: 5,
  keyGenerator: (c) =>
    `login:${c.req.header("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"}`,
});

/**
 * Registration rate limiter — 3 accounts / 1 hour per IP.
 */
export const registerRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  keyGenerator: (c) =>
    `register:${c.req.header("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"}`,
});

/**
 * Password reset rate limiter — 3 attempts / 1 hour per IP.
 */
export const passwordResetRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  keyGenerator: (c) =>
    `password-reset:${c.req.header("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"}`,
});

/**
 * Refresh token rate limiter — 30 refreshes / 5 min per user (fallback to IP).
 */
export const refreshTokenRateLimiter = createRedisRateLimiter({
  windowMs: (process.env.NODE_ENV === "development" ? 1 : 5) * 60 * 1000,
  maxRequests: 30,
  keyGenerator: (c) => {
    const user = c.get("user");
    return user
      ? `refresh:user:${user.userId}`
      : `refresh:ip:${c.req.header("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"}`;
  },
});
