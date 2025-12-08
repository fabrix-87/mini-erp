import rateLimit from 'express-rate-limit';
import logger from '../config/logger'; // Default import, come nella tua setup

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Più permissivo in sviluppo
  statusCode: 429, // Codice HTTP per limite superato
  message: 'Too many requests, please try again later.', // Messaggio default
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`); // Logging custom
    res.status(options.statusCode).send(options.message); // Invia risposta
  }
});

export default limiter;