// config/redis.ts
import { createClient } from 'redis';
import logger from './logger';

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

// Helper functions per session management
export const sessionKeys = {
  // Session data: user info + metadata
  session: (userId: number) => `session:${userId}`,
  
  // Refresh token whitelist: userId -> tokenId mapping
  refreshToken: (userId: number) => `refresh:${userId}`,
  
  // JWT blacklist: jti -> expiration
  blacklist: (jti: string) => `blacklist:${jti}`,
  
  // Rate limiting
  rateLimit: (identifier: string) => `rate:${identifier}`,
};

export { redisClient };