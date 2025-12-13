import { z, ZodError, ZodType } from "zod";
import { ValidationError } from "../utils/app-error"; 
import logger from "../config/logger"; 
import { ValidateOptions } from '../types/validate'
import { Decimal } from "@prisma/client/runtime/client";

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

/**
 * Schema per Decimal(10, 2) - Strategy Value
 */
export const StrategyValueSchema = z
  .union([
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Formato non valido (max 2 decimali)"),
    z.number(),
  ])
  .transform((val) => new Decimal(val))
  .refine((val) => val.greaterThanOrEqualTo(0), {
    message: "Il valore deve essere >= 0",
  });

/**
 * Schema per Decimal(19, 4) - Prezzi
 */
export const PriceSchema = z
  .union([
    z
      .string()
      .regex(/^\d+(\.\d{1,4})?$/, "Formato prezzo non valido (max 4 decimali)"),
    z.number(),
  ])
  .transform((val) => new Decimal(val))
  .refine((val) => val.greaterThan(0), {
    message: "Il prezzo deve essere > 0",
  });

/**
 * Schema per Decimal(19, 4) - Prezzi
 */
export const CreditLimitSchema = z
  .union([
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Formato prezzo non valido (max 2 decimali)"),
    z.number(),
  ])
  .transform((val) => new Decimal(val))
  .refine((val) => val.greaterThanOrEqualTo(0), {
    message: "Il limite deve essere >= 0",
  });

/**
 * Schema per Decimal(5, 2) - Percentuale sconto
 */
export const DiscountPercentSchema = z
  .union([
    z
      .string()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "Formato percentuale non valido (max 2 decimali)"
      ),
    z.number(),
  ])
  .transform((val) => new Decimal(val))
  .refine((val) => val.greaterThanOrEqualTo(0) && val.lessThanOrEqualTo(100), {
    message: "La percentuale deve essere tra 0 e 100",
  })
  .optional()
  .nullable();