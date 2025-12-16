import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import limiter from "./middleware/rate-limit";
import logger from "./config/logger";
import errorHandler, { notFoundHandler } from "./middleware/error-handler";
import { prisma } from "./config/prisma-client";
import { prismaVersion } from "./generated/prisma/internal/prismaNamespace";
import apiRouter from "./routes/index";
import validateEnv from "./config/validate-env";
validateEnv();

// Inizializza l'app Express
const app: Application = express();

/**
 * Funzione per avviare il server Express con tutte le configurazioni necessarie.
 * @returns {Promise<Express.Application>} L'istanza dell'app Express configurata.
 */
export const initApp = async (): Promise<Application> => {
  // 1. Inizializzazione Database PostgreSQL
  try {
    await prisma.$connect();
    logger.info("✅ PostgreSQL connected and Prisma client initialized.");
  } catch (err: any) {
    logger.error(`❌ CRITICAL: PostgreSQL connection failed: ${err.message}`);
    process.exit(1);
  }

  // 2. Inizializzazione Redis
  try {
    const { connectRedis } = await import("./config/redis");
    await connectRedis();
    logger.info("✅ Redis connected successfully.");
  } catch (err: any) {
    logger.error(`❌ CRITICAL: Redis connection failed: ${err.message}`);
    process.exit(1);
  }

  // 3. Middleware di Sicurezza e Parsing
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URI,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(cookieParser());
  app.use(limiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // Utile per form submission

  // 4. Health Check Endpoint
  app.get("/health", async (req, res) => {
    const health: any = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: "unknown",
        redis: "unknown",
      },
      prismaVersion: prismaVersion,
    };

    // Check PostgreSQL
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.services.database = "connected";
    } catch (error: any) {
      health.services.database = "disconnected";
      health.status = "degraded";
    }

    // Check Redis
    try {
      const { redisClient } = await import("./config/redis");
      await redisClient.ping();
      health.services.redis = "connected";
    } catch (error: any) {
      health.services.redis = "disconnected";
      health.status = "degraded";
    }

    const statusCode = health.status === "ok" ? 200 : 503;
    res.status(statusCode).json(health);
  });

  // 5. Carico tutti gli endpoint
  app.use("/api", apiRouter);

  // 6. Gestione Errori Finali
  // 404 - Rotte non trovate
  app.use(notFoundHandler);

  // Global Error Handler - Deve essere l'ultimo middleware
  app.use(errorHandler);

  return app;
};
