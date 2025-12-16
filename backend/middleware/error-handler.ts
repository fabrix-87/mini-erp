// middleware/errorHandler.ts

import { Request, Response, NextFunction } from "express";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from "../generated/prisma/internal/prismaNamespace";

import AppError, {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  TooManyRequestsError,
  ValidationError,
} from "../utils/app-error";
import logger from "../config/logger";

// =========================================================================
// HELPER PER GESTIONE ERRORI SPECIFICI
// =========================================================================

/**
 * Converte gli errori noti di Prisma in AppError appropriati.
 */
const handlePrismaError = (err: PrismaClientKnownRequestError): AppError => {
  switch (err.code) {
    case "P2002": {
      const target =
        (err.meta?.target as string[])?.join(", ") || "campo univoco";
      return new ConflictError(
        `Il valore fornito per '${target}' è già in uso.`
      );
    }
    case "P2025":
      return new NotFoundError("Record non trovato nel database.");
    
    case "P2003": {
      const field = err.meta?.field_name || "campo";
      return new BadRequestError(
        `Operazione fallita: riferimento a '${field}' non valido o inesistente.`
      );
    }
    case "P2000": {
      const field = err.meta?.column_name || "campo";
      return new BadRequestError(
        `Il valore fornito per '${field}' è troppo lungo.`
      );
    }
    case "P2001":
      return new NotFoundError(
        "Il record ricercato non esiste nella relazione specificata."
      );
    
    case "P2011":
      return new BadRequestError("Vincolo di null violato su un campo obbligatorio.");
    
    case "P2012":
      return new BadRequestError("Valore mancante per un campo obbligatorio.");
    
    case "P2014":
      return new BadRequestError(
        "La modifica violerebbe una relazione richiesta tra modelli."
      );
    
    case "P2021":
      return new InternalServerError("La tabella specificata non esiste nel database.");
    
    case "P2022":
      return new InternalServerError("La colonna specificata non esiste nel database.");
    
    default:
      logger.error("Prisma Error non gestito", {
        code: err.code,
        message: err.message,
        meta: err.meta,
        clientVersion: err.clientVersion,
      });
      return new InternalServerError(
        "Errore del database. Il team tecnico è stato notificato."
      );
  }
};

/**
 * Gestisce errori di inizializzazione Prisma
 */
const handlePrismaInitializationError = (
  err: PrismaClientInitializationError
): AppError => {
  logger.error("Prisma Initialization Error", {
    message: err.message,
    errorCode: err.errorCode,
  });
  return new InternalServerError(
    "Impossibile connettersi al database. Riprova più tardi."
  );
};

/**
 * Gestisce errori JWT
 */
const handleJWTError = (): AppError =>
  new UnauthorizedError("Token non valido. Effettua nuovamente il login.");

const handleJWTExpiredError = (): AppError =>
  new UnauthorizedError("Token scaduto. Effettua nuovamente il login.");

/**
 * Sanitizza i dati sensibili dalle informazioni di debug
 */
const sanitizeRequestInfo = (req: Request) => {
  const body = { ...req.body };
  const sensitiveFields = ["password", "token", "apiKey", "secret", "creditCard", "passwordConfirm"];
  
  sensitiveFields.forEach(field => {
    if (body[field]) {
      body[field] = "[REDACTED]";
    }
  });

  return {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  };
};

// =========================================================================
// FUNZIONI DI RISPOSTA (DEV vs PROD)
// =========================================================================

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  // Logging strutturato per errori non operazionali
  if (!err.isOperational) {
    logger.error("ERRORE CRITICO NON OPERAZIONALE", {
      errorDetails: {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
        isOperational: err.isOperational,
      },
      originalError: err.cause
        ? {
            name: err.cause.name,
            message: err.cause.message,
            stack: err.cause.stack,
          }
        : null,
      requestDetails: sanitizeRequestInfo(req),
    });
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(err.errors && err.errors.length > 0 && { errors: err.errors }),
    stack: err.stack,
    originalError: err.cause
      ? {
          name: err.cause.name,
          message: err.cause.message,
          stack: err.cause.stack,
        }
      : null,
    requestInfo: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
    },
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    const response: Record<string, any> = {
      status: err.status,
      message: err.message,
    };

    // Aggiungi errors solo se esistono e non sono vuoti
    if (err.errors && err.errors.length > 0) {
      response.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
  } else {
    // Log completo per debugging interno
    logger.error("ERRORE INTERNO DEL SERVER", {
      error: {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
      },
      stack: err.stack,
      cause: err.cause,
    });

    // Risposta generica sicura per il client
    res.status(500).json({
      status: "error",
      message: "Si è verificato un errore interno. Il team tecnico è stato notificato.",
    });
  }
};

// =========================================================================
// MIDDLEWARE GLOBALE
// =========================================================================

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Evita di processare se la risposta è già stata inviata
  if (res.headersSent) {
    return next(err);
  }

  let error: AppError;

  // =========================================================================
  // TRASFORMAZIONE ERRORI DI TERZE PARTI IN AppError
  // =========================================================================

  if (err instanceof PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof PrismaClientValidationError) {
    error = new BadRequestError(
      "Dati non validi: verifica i campi inviati e riprova."
    );
    logger.warn("Prisma Validation Error", { originalError: err.message });
  } else if (err instanceof PrismaClientInitializationError) {
    error = handlePrismaInitializationError(err);
  } else if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  } else if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  } else if (err instanceof SyntaxError && "body" in err) {
    error = new BadRequestError(
      "Formato JSON non valido nel corpo della richiesta."
    );
  } else if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = new BadRequestError(
        "Il file caricato supera la dimensione massima consentita."
      );
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      error = new BadRequestError("Campo file non previsto nella richiesta.");
    } else {
      error = new BadRequestError(
        `Errore durante il caricamento del file: ${err.message}`
      );
    }
  } else if (err instanceof AppError) {
    // Se è già un AppError (incluse tutte le sottoclassi), usalo direttamente
    error = err;
  } else {
    // Fallback: crea un nuovo AppError preservando le informazioni originali
    const statusCode =
      typeof err.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600
        ? err.statusCode
        : 500;
    const message = err.message || "Errore sconosciuto";
    const isOperational = statusCode < 500; // 4xx = operazionale, 5xx = non operazionale

    error = new AppError(message, statusCode, isOperational, [], err);
  }

  // Gestione header Retry-After per rate limiting
  if (error instanceof TooManyRequestsError && error.retryAfter) {
    res.setHeader("Retry-After", error.retryAfter.toString());
  }

  // =========================================================================
  // LOGGING DIFFERENZIATO
  // =========================================================================

  const logContext = {
    statusCode: error.statusCode,
    message: error.message,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id, // Se hai autenticazione
  };

  if (error.statusCode >= 500) {
    logger.error("Errore Server", { ...logContext, stack: error.stack });
  } else if (error.statusCode >= 400) {
    logger.warn("Errore Client", logContext);
  }

  // =========================================================================
  // INVIO RISPOSTA
  // =========================================================================

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Gestore per le rotte non trovate (404).
 * Da registrare dopo tutte le rotte, ma prima di errorHandler.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(new NotFoundError(`La route ${req.originalUrl} non esiste`));
};

export default errorHandler;
