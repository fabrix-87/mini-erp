import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import limiter from "./middleware/rate-limit";
import logger from "./config/logger";
import errorHandler, { notFoundHandler } from "./middleware/error-handler";
import { prisma } from "./config/prisma-client";
import { prismaVersion } from "./generated/prisma/internal/prismaNamespace";
import apiRouter from './routes/index'
import validateEnv from './config/validate-env';
validateEnv();

// Inizializza l'app Express
const app: Application = express();

/**
 * Funzione per avviare il server Express con tutte le configurazioni necessarie.
 * @returns {Promise<Express.Application>} L'istanza dell'app Express configurata.
 */
export const initApp = async (): Promise<Application> => {
  // 1. Inizializzazione Database
  try {
    // Verifica la connessione a Prisma con PostgreSQL
    await prisma.$connect();
    logger.info("✅ PostgreSQL connected and Prisma client initialized.");
  } catch (err: any) {
    // Errore critico: se il DB primario non è disponibile, l'app non può avviarsi.
    logger.error(`❌ CRITICAL: PostgreSQL connection failed: ${err.message}`);
    // Termina il processo per prevenire l'avvio di un'app non funzionante.
    process.exit(1);
  }

  // 2. Middleware di Sicurezza e Parsing
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

  // 3. Health Check Endpoint
  app.get("/health", async (req, res) => {
    try {
      // Verifica la connessione al database usando Prisma
      await prisma.$queryRaw`SELECT 1`;

      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "connected",
        prismaVersion: prismaVersion,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "disconnected",
        error: error.message,
      });
    }
  });

  // 4. Carico tutti gli endpoint 
  app.use("/api", apiRouter);

  // 5. Gestione Errori Finali
  // 404 - Rotte non trovate
  app.use(notFoundHandler);

  // Global Error Handler - Deve essere l'ultimo middleware
  app.use(errorHandler);

  return app;
};
