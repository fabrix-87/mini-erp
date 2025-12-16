// server.ts
import "dotenv/config";
import http from "http";
import { initApp } from "./app"; // importa la funzione di inizializzazione dell'app
import logger from "./config/logger";
import { initializeSocket } from "./config/socket";

const PORT = process.env.PORT || 5000;

/**
 * 🚀 Funzione principale per avviare il server.
 * Avvolgiamo tutto in una funzione async per gestire l'inizializzazione.
 */
const startServer = async () => {
    let app: any;
    try {
        // 1. Inizializza l'app (attende DB, middleware, ecc.)
        app = await initApp();
        logger.info("✅ Application core initialized.");
    } catch (error: any) {
        // Se initApp fallisce (es. connessione DB), l'app non può partire.
        logger.error(`❌ Fatal: Failed to initialize app: ${error.message}`);

        console.error("--- ERROR STACK TRACE ---");
        console.error(error.stack); 
        console.error("-------------------------");
        
        process.exit(1); // Esce con errore
    }

    // 2. Crea il server HTTP 
    const server = http.createServer(app);

    // 3. Avvia Socket.io 
    initializeSocket(server);
    logger.info("✅ Socket.io initialized.");

    // 4. Avvia il server HTTP
    server.listen(PORT, () => {
        logger.info(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // 5. Gestisci graceful shutdown 
    const shutdown = async (signal: string) => {
        logger.info(`${signal} received: closing server...`);
        
        // Chiudi Redis
        try {
            const { disconnectRedis } = await import('./config/redis');
            await disconnectRedis();
        } catch (error: any) {
            logger.error(`Error closing Redis: ${error.message}`);
        }

        // Chiudi Prisma
        try {
            await require('./config/prisma-client').prisma.$disconnect();
            logger.info('✅ Database connection closed');
        } catch (error: any) {
            logger.error(`Error closing database: ${error.message}`);
        }
        
        server.close(() => {
            logger.info("Server closed");
            process.exit(0);
        });

        // Force close dopo 10 secondi
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
};

// --- Avvio ---
startServer();

// --- Gestione Errori di Processo ---
// (Altamente raccomandato, dal mio suggerimento precedente)
process.on('unhandledRejection', (reason: any, promise: any) => {
    logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // In produzione, si potrebbe far riavviare il processo
    // process.exit(1);
});

process.on('uncaughtException', (err: any) => {
    logger.error('❌ Uncaught Exception:', err);
    // Questo è un errore critico, l'app è in uno stato instabile.
    process.exit(1);
});
