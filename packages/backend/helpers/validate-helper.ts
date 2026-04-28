// helpers/validate-helper.ts
import { z, ZodError, ZodType } from "zod";
import { ValidationError } from "../utils/app-error-utils";
import logger from "../config/logger-config";
import type { ValidateOptions } from "../types/validate-types";

// ============================================================================
// ZOD ERROR HANDLER
// ============================================================================

/**
 * Converts a ZodError into a typed ValidationError with field-level details.
 * Logs a warning with the full error context before throwing.
 *
 * @param error   - The ZodError thrown during schema parsing
 * @param context - Human-readable label for the validation context (used in logs)
 */
export const handleZodError = (error: ZodError, context: string): never => {
  const errorMessages = error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));

  logger.warn(`${context} validation failed`, {
    errors: errorMessages,
    issueCount: error.issues.length,
  });

  throw new ValidationError("Errore di validazione", errorMessages);
};

// ============================================================================
// SCHEMA OPTIONS
// ============================================================================

/**
 * Applies strip/passthrough options to a Zod schema before parsing.
 *
 * @param schema  - The base Zod schema to process
 * @param options - Validation options controlling strip and passthrough behavior
 */
export const applySchemaOptions = (schema: ZodType, options: ValidateOptions): ZodType => {
  let processedSchema = schema;

  if (options.stripUnknown && "strip" in processedSchema) {
    processedSchema = (processedSchema as z.ZodObject<any>).strip();
  }

  if (options.passthrough && "passthrough" in processedSchema) {
    processedSchema = (processedSchema as z.ZodObject<any>).passthrough();
  }

  return processedSchema;
};
