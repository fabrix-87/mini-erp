import { sanitizeForLogging } from '@/helpers/error-helper';
import winston, { createLogger } from 'winston';
import 'winston-daily-rotate-file';

const { format, transports } = winston;
const { combine, timestamp, label, printf, errors, json,  colorize } = format;

/**
 * Sanitize metadata for logging.
 * @param info - Winston log information.
 */
const sanitizeMetadata = winston.format((info) => {
  return sanitizeForLogging(info) as winston.Logform.TransformableInfo;
});

// =========================================================================
// FORMATO DEVELOPMENT (Leggibile con oggetti espansi)
// =========================================================================

const devFormat = printf(({ level, message, label: lbl, timestamp: ts, stack, ...metadata }) => {
  let msg = `${ts} [${lbl}] ${level}: ${message}`;
  
  // Aggiungi stack trace se presente
  if (stack) {
    msg += `\n${stack}`;
  }
  
  // Aggiungi metadata aggiuntivi (oggetti, errori originali, etc.)
  const metadataKeys = Object.keys(metadata);
  if (metadataKeys.length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

// =========================================================================
// FORMATO PRODUCTION (JSON strutturato)
// =========================================================================

const prodFormat = combine(
  errors({ stack: true }), // Cattura stack trace
  timestamp(),
  json() // Output JSON strutturato
);

// =========================================================================
// LOGGER CONFIGURATION
// =========================================================================

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    label({ label: process.env.NODE_ENV || 'dev' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    sanitizeMetadata(),
    errors({ stack: true }), // IMPORTANTE: Cattura stack trace degli errori
    process.env.NODE_ENV === 'development' ? devFormat : prodFormat
  ),
  // Metadata di default per tutti i log
  defaultMeta: { 
    service: process.env.APP_NAME || 'backend',
    environment: process.env.NODE_ENV 
  },
  transports: [
    // In produzione: Log su file con rotazione giornaliera
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        format: combine(
          errors({ stack: true }),
          json()
        )
      }),
      new transports.File({ 
        filename: 'logs/combined.log',
        format: json()
      }),
      new transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: json()
      })
    ] : []),
    // Console transport
    new transports.Console({
      format: process.env.NODE_ENV === 'development' 
        ? combine(
            colorize({ all: true }),
            devFormat
          )
        : json()
    })
  ],
  // Gestione eccezioni non catturate
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' })
  ]
});

export default logger;
