import crypto from "node:crypto";
import { redisClient } from "@/config/redis";

/**
 * Cache options
 */
interface CacheSetOptions {
  ttl?: number; // seconds
}

/**
 * Build deterministic hash key
 */
export const buildCacheKey = (
  namespace: string,
  payload?: unknown,
): string => {
  if (!payload) return namespace;

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  return `${namespace}:${hash}`;
};

/**
 * Get cached value
 */
export const getCache = async <T>(
  key: string,
): Promise<T | null> => {
  const cached = await redisClient.get(key);

  if (!cached) return null;

  return JSON.parse(cached) as T;
};

/**
 * Set cache value
 */
export const setCache = async <T>(
  key: string,
  value: T,
  options?: CacheSetOptions,
): Promise<void> => {
  const payload = JSON.stringify(value);

  if (options?.ttl) {
    await redisClient.set(key, payload, {
      EX: options.ttl,
    });
    return;
  }

  await redisClient.set(key, payload);
};

/**
 * Delete a single key
 */
export const deleteCacheKey = async (
  key: string,
): Promise<void> => {
  await redisClient.del(key);
};

/**
 * Delete all keys by namespace
 * ⚠️ Uses SCAN to avoid blocking Redis
 */
export const deleteCacheByNamespace = async (
  namespace: string,
): Promise<void> => {
  const pattern = `${namespace}:*`;

  for await (const keys of redisClient.scanIterator({
    MATCH: pattern,
    COUNT: 100,
  })) {
    if (keys.length) {
      await redisClient.del(keys);
    }
  }
};
