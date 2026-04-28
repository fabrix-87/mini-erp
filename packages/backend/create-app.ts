import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { prisma } from "./config/prisma-config";
import validateEnv from "./config/env-config";
import logger from "./config/logger-config";
import { connectRedis } from "./config/redis-config";
import { createHonoApp } from "./lib/hono-app";
import apiRoutes from "./routes";

export const createApp = async () => {
  validateEnv();

  try {
    await prisma.$connect();
    logger.info("✅ PostgreSQL connected and Prisma client initialized.");
  } catch (error: any) {
    logger.error(`❌ CRITICAL: PostgreSQL connection failed: ${error.message}`);
    process.exit(1);
  }

  try {
    await connectRedis();
    logger.info("✅ Redis connected successfully.");
  } catch (error: any) {
    logger.error(`❌ CRITICAL: Redis connection failed: ${error.message}`);
    process.exit(1);
  }

  const app = createHonoApp();

  if (process.env.NODE_ENV === "development") {
    app.use("*", honoLogger());
  }

  app.use(
    "*",
    cors({
      origin: process.env.FRONTEND_URI || "http://localhost:3000",
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "x-device-fingerprint"],
    })
  );

  app.route("/api", apiRoutes);

  app.notFound((c) => {
    return c.json(
      {
        success: false,
        message: `Route not found: ${c.req.path}`,
      },
      404
    );
  });

  app.onError((error, c) => {
    logger.error("❌ Unhandled application error:", error);

    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  });

  return app;
};