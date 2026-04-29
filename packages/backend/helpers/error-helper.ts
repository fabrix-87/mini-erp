// ============================================================================
// SERIALIZATION
// ============================================================================

import { isAppError, isError, SerializedError } from "@/types/error-types";

/**
 * Recursively serializes an error and its full cause chain into a plain object.
 * Safe to pass to JSON.stringify or structured loggers.
 *
 * @param err - Any thrown value
 */
export const serializeError = (err: unknown): SerializedError => {
  if (!isError(err)) {
    return {
      name: "UnknownError",
      message: typeof err === "string" ? err : JSON.stringify(err),
      isOperational: false,
    };
  }

  return {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    isOperational: isAppError(err) ? err.isOperational : false,
    statusCode: isAppError(err) ? err.statusCode : undefined,
    cause: err.cause ? serializeError(err.cause) : undefined,
  };
};

/**
 * Extracts a flat array representing the full error cause chain.
 * Useful for structured logging of nested errors.
 *
 * @param err - Any thrown value
 */
export const extractErrorChain = (err: unknown): SerializedError[] => {
  const chain: SerializedError[] = [];
  let current: unknown = err;

  while (isError(current)) {
    chain.push(serializeError(current));
    current = (current as Error & { cause?: unknown }).cause;
  }

  return chain;
};

// ============================================================================
// SANITIZATION
// ============================================================================

const SENSITIVE_FIELDS = new Set([
  "password",
  "token",
  "refreshtoken",
  "secret",
  "authorization",
  "cookie",
  "creditcard",
  "cvv",
  "ssn",
]);

/**
 * Recursively redacts sensitive fields from any object.
 * Safe to use before passing data to any external logger or error tracker.
 * Does NOT mutate the original object.
 *
 * @param data - Any value to sanitize
 */
export const sanitizeForLogging = (data: unknown): unknown => {
  if (typeof data !== "object" || data === null) return data;

  if (Array.isArray(data)) return data.map(sanitizeForLogging);

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    result[key] = SENSITIVE_FIELDS.has(key.toLowerCase())
      ? "***REDACTED***"
      : sanitizeForLogging(value);
  }

  return result;
};

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Normalizes any thrown value into a standard Error instance.
 * Useful at process boundaries (e.g. unhandledRejection) where the
 * thrown value may not be an Error.
 *
 * @param err - Any thrown value
 */
export const normalizeError = (err: unknown): Error => {
  if (isError(err)) return err;
  if (typeof err === "string") return new Error(err);
  return new Error(JSON.stringify(err));
};
