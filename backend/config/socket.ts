// config/socket.ts
import { Server, Socket } from 'socket.io';
import http from 'http';
import logger from './logger';

let io: Server | null = null;

/**
 * Inizializza Socket.IO
 */
export const initializeSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URI || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });

    // Join room per import specifico
    socket.on('join-import', (importId) => {
      socket.join(`import-${importId}`);
      logger.info(`Socket ${socket.id} joined import-${importId}`);
    });
  });

  return io;
};

/**
 * Ottieni istanza Socket.IO
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emetti evento di progresso import
 */
export const emitImportProgress = (importId: string, data: any) => {
  if (io) {
    io.to(`import-${importId}`).emit('import-progress', data);
  }
};

/**
 * Emetti evento di completamento import
 */
export const emitImportComplete = (importId: string, data: any) => {
  if (io) {
    io.to(`import-${importId}`).emit('import-complete', data);
  }
};

/**
 * Emetti evento di errore import
 */
export const emitImportError = (importId: string, error: Error) => {
  if (io) {
    io.to(`import-${importId}`).emit('import-error', { error: error.message });
  }
};