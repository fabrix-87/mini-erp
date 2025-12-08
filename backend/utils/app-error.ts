// utils/AppError.ts

/**
 * Interfaccia per il dettaglio del singolo errore di validazione.
 * Utilizzata per popolare l'array 'errors'.
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Classe base per tutti gli errori operazionali dell'applicazione.
 * Estende la classe Error nativa.
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
    cause?: Error 
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;
    this.cause = cause;

    // Cattura lo stack trace escludendo il costruttore di questa classe
    Error.captureStackTrace(this, this.constructor);
  }
}

// --- Sottoclassi per Errori Comuni (Status Code Predefiniti) ---

export class BadRequestError extends AppError {
  constructor(message = 'Richiesta non valida') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorizzato') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accesso negato') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Risorsa non trovata') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflitto con una risorsa esistente') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Errore di validazione', errors: ValidationErrorDetail[] = []) {
    super(message, 422, true, errors);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Errore interno del server') {
    super(message, 500, false); // false = Non operazionale (probabile bug)
  }
}

export default AppError;