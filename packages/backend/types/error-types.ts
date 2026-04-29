import AppError from "@/utils/app-error-utils";

// ============================================================================
// TYPES
// ============================================================================

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  isOperational: boolean;
  statusCode?: number;
  cause?: SerializedError;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Checks whether the given value is an instance of AppError.
 */
export const isAppError = (err: unknown): err is AppError =>
  err instanceof AppError;

/**
 * Checks whether the given value is an operational (expected) error.
 * Non-operational errors represent programming bugs and should trigger alerts.
 */
export const isOperationalError = (err: unknown): boolean =>
  isAppError(err) && err.isOperational;

/**
 * Checks whether the given value is a standard Error instance.
 */
export const isError = (err: unknown): err is Error =>
  err instanceof Error;
