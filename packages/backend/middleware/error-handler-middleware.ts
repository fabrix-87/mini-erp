// middleware/error-handler-middleware.ts
import { Context } from "hono";
import { createMiddleware } from "hono/factory";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from "../generated/prisma/internal/prismaNamespace";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import AppError, {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  TooManyRequestsError,
} from "../utils/app-error-utils";
import logger from "../config/logger-config";
import type { AppBindings } from "../lib/hono-app";
import { sendError } from "../utils/response-utils";

// ============================================================================
// PRISMA ERROR HANDLERS
// ============================================================================

/**
 * Converts known Prisma errors into typed AppError instances.
 */
const handlePrismaError = (err: PrismaClientKnownRequestError): AppError => {
  switch (err.code) {
    case "P2002": {
      const target = (err.meta?.target as string[])?.join(", ") || "campo univoco";
      return new ConflictError(`Il valore fornito per '${target}' è già in uso.`);
    }
    case "P2025":
      return new NotFoundError("Record non trovato nel database.");
    case "P2003": {
      const field = err.meta?.field_name || "campo";
      return new BadRequestError(
        `Operazione fallita: riferimento a '${field}' non valido o inesistente.`,
      );
    }
    case "P2000": {
      const field = err.meta?.column_name || "campo";
      return new BadRequestError(`Il valore fornito per '${field}' è troppo lungo.`);
    }
    case "P2001":
      return new NotFoundError("Il record ricercato non esiste nella relazione specificata.");
    case "P2011":
      return new BadRequestError("Vincolo di null violato su un campo obbligatorio.");
    case "P2012":
      return new BadRequestError("Valore mancante per un campo obbligatorio.");
    case "P2014":
      return new BadRequestError("La modifica violerebbe una relazione richiesta tra modelli.");
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
      return new InternalServerError("Errore del database. Il team tecnico è stato notificato.");
  }
};

/**
 * Converts a Prisma initialization error into an InternalServerError.
 */
const handlePrismaInitializationError = (err: PrismaClientInitializationError): AppError => {
  logger.error("Prisma Initialization Error", {
    message: err.message,
    errorCode: err.errorCode,
  });
  return new InternalServerError("Impossibile connettersi al database. Riprova più tardi.");
};

// ============================================================================
// JWT ERROR HANDLERS
// ============================================================================

/** Returns an UnauthorizedError for invalid JWT signatures. */
const handleJWTError = (): AppError =>
  new UnauthorizedError("Token non valido. Effettua nuovamente il login.");

/** Returns an UnauthorizedError for expired JWTs. */
const handleJWTExpiredError = (): AppError =>
  new UnauthorizedError("Token scaduto. Effettua nuovamente il login.");

// ============================================================================
// REQUEST SANITIZER
// ============================================================================

/** Sensitive fields that must always be redacted in logs. */
const SENSITIVE_FIELDS = ["password", "token", "refreshToken", "secret", "authorization", "cookie"];

/**
 * Sanitizes sensitive fields from any object for safe logging.
 * Handles nested objects and arrays recursively.
 */
export const sanitizeRequestInfo = (data: unknown): unknown => {
  if (typeof data !== "object" || data === null) return data;

  if (Array.isArray(data)) return data.map(sanitizeRequestInfo);

  const sanitized: Record<string, unknown> = {};

  for (const key in data as Record<string, unknown>) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as Record<string, unknown>)[key];
      if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object") {
        sanitized[key] = sanitizeRequestInfo(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Extracts and sanitizes the request body from the Hono context for logging.
 * Note: reads the raw text to avoid consuming the body stream.
 */
export const getSanitizedBody = async (c: Context<AppBindings>): Promise<unknown> => {
  try {
    const contentType = c.req.header("content-type");
    if (contentType?.includes("application/json")) {
      const body = await c.req.json();
      return sanitizeRequestInfo(body);
    }
    return {};
  } catch {
    return { _error: "Unparseable body" };
  }
};

// ============================================================================
// DEV vs PROD RESPONSE
// ============================================================================

/**
 * Sends a detailed error response in development mode.
 */
const sendErrorDev = async (err: AppError, c: Context<AppBindings>) => {
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
            name: (err.cause as Error).name,
            message: (err.cause as Error).message,
            stack: (err.cause as Error).stack,
          }
        : null,
      requestDetails: {
        method: c.req.method,
        url: c.req.url,
        body: await getSanitizedBody(c), // ← ora asincrono
      },
    });
  }

  return c.json(
    {
      status: err.status,
      message: err.message,
      ...(err.errors && err.errors.length > 0 && { errors: err.errors }),
      stack: err.stack,
      originalError: err.cause
        ? {
            name: (err.cause as Error).name,
            message: (err.cause as Error).message,
            stack: (err.cause as Error).stack,
          }
        : null,
      requestInfo: {
        method: c.req.method,
        url: c.req.url,
      },
    },
    err.statusCode as any,
  );
};

/**
 * Sends a sanitized error response in production mode.
 */
const sendErrorProd = (err: AppError, c: Context<AppBindings>) => {
  if (err.isOperational) {
    return c.json(
      {
        status: err.status,
        message: err.message,
        ...(err.errors && err.errors.length > 0 && { errors: err.errors }),
      },
      err.statusCode as any,
    );
  }

  // Non-operational error: log internally, send generic message
  logger.error("ERRORE INTERNO DEL SERVER", {
    error: {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
    },
    stack: err.stack,
    cause: err.cause,
  });

  return sendError(c, {
    statusCode: 500,
    message: "Si è verificato un errore interno. Il team tecnico è stato notificato.",
  });
};

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

/**
 * Global Hono error handler middleware.
 * Converts third-party errors (Prisma, JWT, Multer) into typed AppError instances,
 * logs them appropriately, and sends structured JSON responses.
 *
 * Register this as the LAST middleware via app.onError().
 *
 * @example
 * app.onError(globalErrorHandler);
 */
export const globalErrorHandler = async (
  err: unknown,
  c: Context<AppBindings>,
): Promise<Response> => {
  let error: AppError;

  // -- Error normalization --
  if (err instanceof PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof PrismaClientValidationError) {
    error = new BadRequestError("Dati non validi: verifica i campi inviati e riprova.");
    logger.warn("Prisma Validation Error", { originalError: err.message });
  } else if (err instanceof PrismaClientInitializationError) {
    error = handlePrismaInitializationError(err);
  } else if (err instanceof TokenExpiredError) {
    error = handleJWTExpiredError();
  } else if (err instanceof JsonWebTokenError) {
    error = handleJWTError();
  } else if (err instanceof SyntaxError && "body" in err) {
    error = new BadRequestError("Formato JSON non valido nel corpo della richiesta.");
  } else if (err instanceof AppError) {
    error = err;
  } else if (err instanceof Error) {
    error = new AppError(err.message, 500, false, undefined, err);
  } else {
    error = new AppError("Errore sconosciuto", 500, false);
  }

  // -- Retry-After header for rate limiting --
  if (error instanceof TooManyRequestsError && error.retryAfter) {
    c.header("Retry-After", error.retryAfter.toString());
  }

  // -- Structured logging --
  const logContext = {
    statusCode: error.statusCode,
    message: error.message,
    url: c.req.url,
    method: c.req.method,
    userId: c.get("user")?.userId,
  };

  if (error.statusCode >= 500) {
    logger.error("Errore Server", { ...logContext, stack: error.stack });
  } else if (error.statusCode >= 400) {
    logger.warn("Errore Client", logContext);
  }

  // -- Response --
  return process.env.NODE_ENV === "development"
    ? await sendErrorDev(error, c) // ← await perché ora è async
    : sendErrorProd(error, c);
};

// ============================================================================
// NOT FOUND HANDLER
// ============================================================================

/**
 * Hono 404 handler for unmatched routes.
 * Register via app.notFound().
 *
 * @example
 * app.notFound(notFoundHandler);
 */
export const notFoundHandler = (c: Context<AppBindings>): Response => {
  return sendError(c, {
    statusCode: 404,
    message: `La route ${c.req.url} non esiste`,
    status: "fail",
  });
};
