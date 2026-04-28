import { prisma } from "../config/prisma-config";
import { prismaVersion } from "../generated/prisma/internal/prismaNamespace";
import { redisClient } from "../config/redis-config";
import { createHonoApp } from "../lib/hono-app";

const healthRoutes = createHonoApp();

/**
 * Returns the application health status.
 */
healthRoutes.get("/", async (c) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: "unknown",
      redis: "unknown",
    },
    prismaVersion,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = "connected";
  } catch {
    health.services.database = "disconnected";
    health.status = "degraded";
  }

  try {
    await redisClient.ping();
    health.services.redis = "connected";
  } catch {
    health.services.redis = "disconnected";
    health.status = "degraded";
  }

  return c.json(health, health.status === "ok" ? 200 : 503);
});

export default healthRoutes;