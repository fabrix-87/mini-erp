// create-app.ts
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger as honoLogger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";
import { prisma } from "./config/prisma-config";
import { connectRedis } from "./config/redis-config";
import { createHonoApp } from "./lib/hono-app";
import { apiRateLimiter } from "./middleware/rate-limit-middleware";
import { globalErrorHandler, notFoundHandler } from "./middleware/error-handler-middleware";
import validateEnv from "./config/env-config";
import logger from "./config/logger-config";
import apiRoutes from "./routes";
import healthRoutes from "./routes/health-routes";

/**
 * Creates and configures the Hono application instance.
 * Handles database/Redis connections, middleware registration,
 * health check endpoint, and route mounting.
 */
export const createApp = async () => {
  validateEnv();

  // 1. Database
  try {
    await prisma.$connect();
    logger.info("✅ PostgreSQL connected and Prisma client initialized.");
  } catch (error: any) {
    logger.error(`❌ CRITICAL: PostgreSQL connection failed: ${error.message}`);
    process.exit(1);
  }

  // 2. Redis
  try {
    await connectRedis();
    logger.info("✅ Redis connected successfully.");
  } catch (error: any) {
    logger.error(`❌ CRITICAL: Redis connection failed: ${error.message}`);
    process.exit(1);
  }

  const app = createHonoApp();

  // 3. Security headers
  app.use("*", secureHeaders());

  // 4. CORS
  app.use(
    "*",
    cors({
      origin: process.env.FRONTEND_URI || "http://localhost:3000",
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "x-device-fingerprint"],
    }),
  );

  // 5. Request logger (development only)
  if (process.env.NODE_ENV === "development") {
    app.use("*", honoLogger());
  }

  // 6. Trailing slash
  app.use("*", trimTrailingSlash());

  // 7. Rate limiter globale sulle API
  app.use("/api/*", apiRateLimiter);

  // 8. Health check
  app.route("/health", healthRoutes);

  // 9. Route API
  app.route("/api", apiRoutes);

  // 10. 404 e error handler
  app.notFound(notFoundHandler);
  app.onError(globalErrorHandler);

  return app;
};
