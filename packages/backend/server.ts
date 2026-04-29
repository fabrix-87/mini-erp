import logger from "./config/logger-config";
import { disconnectRedis } from "./config/redis-config";
import { prisma } from "./config/prisma-config";
import { createApp } from "./create-app";

const PORT = Number(process.env.PORT) || 5000;

/**
 * Starts the Bun HTTP server using the Hono application.
 */
const startServer = async (): Promise<void> => {
  try {
    const app = await createApp();

    const server = Bun.serve({
      port: PORT,
      fetch: app.fetch,
    });

    logger.info(
      `✅ Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
    );

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received: closing server...`);

      const forceExitTimeout = setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10_000);

      forceExitTimeout.unref();

      await Promise.allSettled([disconnectRedis(), prisma.$disconnect()]);

      server.stop(true);
      logger.info("✅ Server closed");
      process.exit(0);
    };

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });
  } catch (error: any) {
    logger.error(`❌ Fatal server startup error: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
};

void startServer();

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("❌ Uncaught Exception:", error);
  process.exit(1);
});
