// middleware/errorHandler.ts

import { Request, Response, NextFunction } from "express";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "../generated/prisma/internal/prismaNamespace";

import AppError, {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} from "../utils/app-error";
import logger from "../config/logger"; // Assicurati che il percorso del logger sia corretto

// =========================================================================
// HELPER PER GESTIONE ERRORI SPECIFICI
// =========================================================================

/**
 * Converte gli errori noti di Prisma in AppError appropriati.
 */
const handlePrismaError = (err: PrismaClientKnownRequestError): AppError => {
  switch (err.code) {
    case "P2002": {
      // Violazione vincolo di unicità (Unique Constraint)
      // err.meta.target solitamente contiene il nome del campo o un array di campi
      const target =
        (err.meta?.target as string[])?.join(", ") || "campo univoco";
      return new ConflictError(
        `Il valore fornito per '${target}' è già in uso.`
      );
    }
    case "P2025": {
      // Record non trovato (comune con operazioni update/delete su ID inesistenti)
      return new NotFoundError("Record non trovato nel database.");
    }
    case "P2003": {
      // Violazione chiave esterna (Foreign Key)
      return new BadRequestError(
        "Operazione fallita: riferimento a un record collegato non valido o inesistente."
      );
    }
    case "P2000": {
      // Valore troppo lungo per la colonna
      return new BadRequestError(
        "Il valore fornito è troppo lungo per il campo del database."
      );
    }
    default:
      // Logga errori Prisma non gestiti specificamente
      logger.error(`Prisma Error non gestito (${err.code}): ${err.message}`);
      return new InternalServerError("Errore generico del database.");
  }
};

/**
 * Gestisce errori JWT
 */
const handleJWTError = () =>
  new UnauthorizedError("Token non valido. Effettua nuovamente il login.");

const handleJWTExpiredError = () =>
  new UnauthorizedError("Token scaduto. Effettua nuovamente il login.");

// =========================================================================
// FUNZIONI DI RISPOSTA (DEV vs PROD)
// =========================================================================

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  // Logging dettagliato per errori non operazionali
  if (!err.isOperational) {
  logger.error('💥 ERRORE CRITICO NON OPERAZIONALE', {
    errorDetails: {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      isOperational: err.isOperational
    },
    originalError: err.cause ? {
      name: err.cause.name,
      message: err.cause.message,
      stack: err.cause.stack  // Stack trace originale
    } : null,
    requestDetails: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
  });
}

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    errors: err.errors,
    stack: err.stack,
    // Aggiungi informazioni sull'errore originale
    originalError: err.cause ? {
      name: err.cause.name,
      message: err.cause.message,
      stack: err.cause.stack
    } : null,
    // Informazioni di contesto
    requestInfo: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query
    },
    error: err
  });
};


const sendErrorProd = (err: AppError, res: Response) => {
  // 1. Errori operazionali fidati: invia messaggio al client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && err.errors.length > 0 && { errors: err.errors }),
    });
  }
  // 2. Errori di programmazione o sconosciuti: non mostrare dettagli
  else {
    // Logga l'errore originale per gli sviluppatori
    logger.error("ERROR 💥", err);

    // Risposta generica
    res.status(500).json({
      status: "error",
      message: "Qualcosa è andato storto sul server.",
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
) => {
  // 1. Inizializzazione di default
  let error = err;

  // Se l'errore non ha statusCode, assegniamo 500
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  // 2. Trasformazione errori di terze parti in AppError

  // Gestione Prisma Error (Known Request)
  if (err instanceof PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  }
  // Gestione Prisma Validation Error (es. tipo dati errato nella query)
  else if (err instanceof PrismaClientValidationError) {
    error = new BadRequestError(
      "Errore di validazione del database: dati non conformi allo schema."
    );
  }
  // Gestione JWT
  else if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  } else if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }
  // Gestione SyntaxError (es. JSON malformato nel body)
  else if (err instanceof SyntaxError && "body" in err) {
    error = new BadRequestError("JSON malformato nel corpo della richiesta.");
  }

  // Se dopo le trasformazioni l'errore non è ancora un'istanza di AppError,
  // ne creiamo uno wrapper mantenendo le proprietà vitali
  if (!(error instanceof AppError)) {
    // Se è un ValidationError (es. lanciato da Zod/Helper ma non istanziato correttamente come AppError)
    if (error.name === "ValidationError") {
      // Manteniamo lo status 422 e gli errori se presenti
      const validationErrors = error.errors || [];
      error = new AppError(
        error.message || "Errore di validazione",
        422,
        true,
        validationErrors,
        err
      );
    } else {
      // Fallback a errore interno
      const message = error.message || "Errore Sconosciuto";
      error = new AppError(message, error.statusCode || 500, false, [], err);
    }
  }

  // 3. Logging (Differenziato per gravità)
  const logMessage = `${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`;

  if (error.statusCode >= 500) {
    logger.error(logMessage, error); // Logga stack trace e dettagli
  } else {
    logger.warn(logMessage); // Logga solo avviso
  }

  // 4. Invio Risposta
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Gestore per le rotte non trovate (404).
 * Da usare alla fine delle definizioni delle rotte, prima di errorHandler.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new NotFoundError(`Route ${req.originalUrl} non trovata`));
};

export default errorHandler;
