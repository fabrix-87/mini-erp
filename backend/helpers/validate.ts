import { z, ZodError, ZodType } from "zod";
import { ValidationError } from "../utils/app-error"; 
import logger from "../config/logger"; 
import { ValidateOptions } from '../types/validate'


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper per gestire errori di validazione Zod
 */
export const handleZodError = (error: ZodError, context: string) => {
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

/**
 * Trasforma i parametri della request applicando le opzioni di parsing
 */
export const applySchemaOptions = (
  schema: ZodType,
  options: ValidateOptions
): ZodType => {
  let processedSchema = schema;

  if (options.stripUnknown) {
    // Se lo schema è un object, applica strip
    if ("strip" in processedSchema) {
      processedSchema = (processedSchema as z.ZodObject<any>).strip();
    }
  }

  if (options.passthrough) {
    // Se lo schema è un object, applica passthrough
    if ("passthrough" in processedSchema) {
      processedSchema = (processedSchema as z.ZodObject<any>).passthrough();
    }
  }

  return processedSchema;
};

