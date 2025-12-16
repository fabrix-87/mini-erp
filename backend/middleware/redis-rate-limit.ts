// middleware/redis-rate-limit.ts
import { Request, Response, NextFunction } from 'express';
import { redisClient, sessionKeys } from '../config/redis';
import logger from '../config/logger';
import { TooManyRequestsError } from '../utils/app-error';

interface RateLimitOptions {
  windowMs: number;      // Finestra temporale in millisecondi
  maxRequests: number;   // Max richieste nella finestra
  keyGenerator?: (req: Request) => string; // Funzione per generare la chiave
  skipSuccessfulRequests?: boolean;        // Non contare richieste con successo
  skipFailedRequests?: boolean;            // Non contare richieste fallite
}

/**
 * Rate limiter basato su Redis con sliding window
 * Più preciso e scalabile rispetto a express-rate-limit in memoria
 */
export const createRedisRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req: Request) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = sessionKeys.rateLimit(keyGenerator(req));
      const now = Date.now();
      const windowStart = now - windowMs;

      // Usa Redis ZSET per sliding window
      const multi = redisClient.multi();

      // 1. Rimuovi richieste fuori dalla finestra
      multi.zRemRangeByScore(key, 0, windowStart);

      // 2. Conta richieste nella finestra
      multi.zCard(key);

      // 3. Aggiungi richiesta corrente
      multi.zAdd(key, { score: now, value: `${now}` });

      // 4. Imposta TTL sulla chiave
      multi.expire(key, Math.ceil(windowMs / 1000));

      const results = await multi.exec();

      // Il risultato del zCard è in results[1]
      const currentRequests = (results?.[1] as unknown as number) || 0;

      // Aggiungi headers informativi
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentRequests));
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      // Verifica limite
      if (currentRequests > maxRequests) {
        logger.warn(`Rate limit exceeded for: ${keyGenerator(req)}`);
        throw new TooManyRequestsError(
          'Troppe richieste. Riprova più tardi.',
          Math.ceil(windowMs / 1000)
        );
      }

      // Se configurato, rimuovi il conteggio se la richiesta fallisce/succede
      const originalSend = res.send;
      res.send = function (data) {
        const statusCode = res.statusCode;
        const shouldSkip =
          (skipSuccessfulRequests && statusCode < 400) ||
          (skipFailedRequests && statusCode >= 400);

        if (shouldSkip) {
          // Rimuovi l'ultima entry aggiunta
          redisClient.zRem(key, `${now}`).catch((err) => {
            logger.error('Error removing rate limit entry:', err);
          });
        }

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      // Se Redis fallisce, lascia passare (fail-open) ma logga
      if (error instanceof TooManyRequestsError) {
        throw error;
      }
      logger.error('Rate limiter error (fail-open):', error);
      next();
    }
  };
};

// ============================================================================
// RATE LIMITERS PRECONFIGURATI
// ============================================================================

/**
 * Rate limiter generale per API (100 req/15min per IP)
 */
export const apiRateLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minuti
  maxRequests: process.env.NODE_ENV === 'production' ? 100 : 1000,
  keyGenerator: (req) => `api:${req.ip}`,
});

/**
 * Rate limiter per login (5 tentativi/15min per IP)
 */
export const loginRateLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyGenerator: (req) => `login:${req.ip}`,
  skipSuccessfulRequests: true, // Conta solo tentativi falliti
});

/**
 * Rate limiter per registrazione (3 account/ora per IP)
 */
export const registerRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 ora
  maxRequests: 3,
  keyGenerator: (req) => `register:${req.ip}`,
});

/**
 * Rate limiter per reset password (3 tentativi/ora per IP)
 */
export const passwordResetRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  keyGenerator: (req) => `password-reset:${req.ip}`,
});

/**
 * Rate limiter per refresh token (30 refresh/5min per utente)
 */
export const refreshTokenRateLimiter = createRedisRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 30,
  keyGenerator: (req) => {
    // Usa userId se disponibile, altrimenti IP
    const user = (req as any).user;
    return user ? `refresh:user:${user.userId}` : `refresh:ip:${req.ip}`;
  },
});