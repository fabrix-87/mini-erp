// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

import { ZodError, ZodType } from "zod";
import { handleZodError } from "../helpers/validate-helper";

/**
 * Valida dati in modo sincrono (utile per service layer)
 * @throws {ValidationError} Se la validazione fallisce
 */
export const validateSync = <T>(
  schema: ZodType<T>,
  data: unknown,
  context: string
): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError(error, context);
    }
    throw error;
  }
};

/**
 * Valida dati in modo asincrono (utile per service layer)
 * @throws {ValidationError} Se la validazione fallisce
 */
export const validateAsync = async <T>(
  schema: ZodType<T>,
  data: unknown,
  context: string
): Promise<T> => {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError(error, context);
    }
    throw error;
  }
};

/**
 * Valida dati e restituisce un risultato senza lanciare eccezioni
 */
export const validateSafe = <T>(schema: ZodType<T>, data: unknown) => {
  return schema.safeParse(data);
};

/**
 * Valida dati in modo asincrono e restituisce un risultato senza lanciare eccezioni
 */
export const validateSafeAsync = async <T>(
  schema: ZodType<T>,
  data: unknown
) => {
  return await schema.safeParseAsync(data);
};
