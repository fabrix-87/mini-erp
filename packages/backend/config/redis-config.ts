// config/redis.ts
import { createClient } from 'redis';
import logger from './logger-config';

// Tipizzazione del client Redis
export type RedisClient = ReturnType<typeof createClient>;

// Creazione client Redis con configurazione
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('❌ Redis: Too many reconnection attempts, giving up');
        return new Error('Redis reconnection failed');
      }
      const delay = Math.min(retries * 100, 3000);
      logger.warn(`⚠️ Redis: Reconnecting... (attempt ${retries})`);
      return delay;
    },
  },
});

// Event listeners
redisClient.on('error', (err) => {
  logger.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('🔄 Redis: Connecting...');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis: Connection established');
});

redisClient.on('reconnecting', () => {
  logger.warn('⚠️ Redis: Reconnecting...');
});

// Connessione iniziale
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error: any) {
    logger.error(`❌ Failed to connect to Redis: ${error.message}`);
    throw error;
  }
};

// Chiusura graceful
export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('✅ Redis: Connection closed');
  } catch (error: any) {
    logger.error(`❌ Error closing Redis connection: ${error.message}`);
  }
};

// ============================================================================
// REDIS KEY PATTERNS - Namespace organization
// ============================================================================

export const sessionKeys = {
  // Session data: user info + metadata
  session: (userId: string) => `session:${userId}`,
  
  // Refresh token whitelist: userId -> tokenId mapping
  refreshToken: (userId: string) => `refresh:${userId}`,
  
  // JWT blacklist: jti -> expiration
  blacklist: (jti: string) => `blacklist:${jti}`,
  
  // User permissions cache: userId -> permissions[]
  permissions: (userId: string) => `permissions:${userId}`,
  
  // Rate limiting
  rateLimit: (identifier: string) => `rate:${identifier}`,
  
  // Failed login attempts (per IP o email)
  loginAttempts: (identifier: string) => `login:attempts:${identifier}`,
};

// ============================================================================
// REDIS TTL CONSTANTS
// ============================================================================

export const RedisTTL = {
  SESSION: 7 * 24 * 60 * 60, // 7 giorni (stesso del refresh token)
  PERMISSIONS: 15 * 60, // 15 minuti (cache permessi)
  RATE_LIMIT: 15 * 60, // 15 minuti
  LOGIN_ATTEMPTS: 30 * 60, // 30 minuti
} as const;

export { redisClient };