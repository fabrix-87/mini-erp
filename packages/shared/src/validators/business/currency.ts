import Decimal from "decimal.js";
import { createDecimalSchema } from "../primitives/decimal";
import { z } from "zod";

/**
 * Schema per prezzo/importo
 */
export const priceSchema = (options?: {
  min?: number;
  max?: number;
  precision?: number;
  defaultValue?: Decimal.Value;
}) =>
  createDecimalSchema(options?.precision ?? 2, {
    positiveOnly: true,
    min: options?.min ?? 0,
    max: options?.max,
    required: true,
    defaultValue: options?.defaultValue,
    messages: {
      invalid: "Prezzo non valido",
      required: "Il prezzo è obbligatorio",
      positive: "Il prezzo deve essere positivo",
      min: options?.min !== undefined ? `Il prezzo deve essere almeno ${options.min}` : undefined,
      max: options?.max !== undefined ? `Il prezzo non può superare ${options.max}` : undefined,
    },
  });

export const priceSchemaOptional = (options?: { min?: number; max?: number; precision?: number }) =>
  createDecimalSchema(options?.precision ?? 2, {
    positiveOnly: true,
    min: options?.min ?? 0,
    max: options?.max,
    messages: {
      invalid: "Prezzo non valido",
      positive: "Il prezzo deve essere positivo",
      min: options?.min !== undefined ? `Il prezzo deve essere almeno ${options.min}` : undefined,
      max: options?.max !== undefined ? `Il prezzo non può superare ${options.max}` : undefined,
    },
  });

/**
 * Standard currency amount schema (Decimal 19,2)
 * Use this as default for prices, amounts, totals
 */
export const currencySchema = priceSchema();

/**
 * Credit limit schema (Decimal 19,2)
 */
export const creditLimitSchema = priceSchema();

/**
 * Schema per percentuale (0-100)
 */
export const percentageSchema = createDecimalSchema(2, {
  min: 0,
  max: 100,
}).pipe(z.instanceof(Decimal, { message: "Percentuale obbligatoria" }));
