// utils/app-error-utils.ts

/**
 * Detail object for a single validation error on a specific field.
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Base class for all operational application errors.
 * Extends the native Error class with HTTP-specific metadata.
 *
 * @param message       - Human-readable error description
 * @param statusCode    - HTTP status code
 * @param isOperational - True for expected errors (4xx), false for bugs (5xx)
 * @param errors        - Optional array of field-level validation errors
 * @param cause         - Optional original error that triggered this one
 */
class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
  public readonly errors?: ValidationErrorDetail[];
  public readonly cause?: Error;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    errors?: ValidationErrorDetail[],
    cause?: Error,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    this.errors = errors;
    this.cause = cause;

    // Capture stack trace excluding this constructor frame
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request — malformed input or invalid parameters.
 */
export class BadRequestError extends AppError {
  constructor(message = "Richiesta non valida") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

/**
 * 401 Unauthorized — missing or invalid authentication credentials.
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Non autorizzato") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * 403 Forbidden — authenticated but lacking required permissions.
 */
export class ForbiddenError extends AppError {
  constructor(message = "Accesso negato") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

/**
 * 404 Not Found — requested resource does not exist.
 */
export class NotFoundError extends AppError {
  constructor(message = "Risorsa non trovata") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * 409 Conflict — request conflicts with an existing resource (e.g. duplicate key).
 */
export class ConflictError extends AppError {
  constructor(message = "Conflitto con una risorsa esistente") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

/**
 * 422 Unprocessable Entity — semantically invalid input with field-level errors.
 */
export class ValidationError extends AppError {
  constructor(message = "Errore di validazione", errors: ValidationErrorDetail[] = []) {
    super(message, 422, true, errors);
    this.name = "ValidationError";
  }
}

/**
 * 429 Too Many Requests — rate limit exceeded.
 *
 * @param retryAfter - Seconds the client should wait before retrying
 */
export class TooManyRequestsError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = "Troppe richieste", retryAfter?: number) {
    super(message, 429);
    this.name = "TooManyRequestsError";
    this.retryAfter = retryAfter;
  }
}

/**
 * 500 Internal Server Error — unexpected server-side failure (non-operational).
 */
export class InternalServerError extends AppError {
  constructor(message = "Errore interno del server") {
    super(message, 500, false);
    this.name = "InternalServerError";
  }
}

export default AppError;
