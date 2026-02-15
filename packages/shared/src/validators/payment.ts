import { z } from "zod";
import { percentageSchema } from "./business/currency";
import { createIdSchema } from "./primitives/id";
import Decimal from "decimal.js";
import { isValidPercentageTotal } from "./primitives/decimal";
import { dateStringSchema } from "./primitives/date";
import { queryBooleanSchema } from "./query/params";
import { sortOrderSchema } from "./query/pagination";

// ============================================================================
// ENUMS
// ============================================================================

export const termTypeSchema = z.enum([
  "anticipated",
  "days_from_invoice",
  "end_of_month",
  "fixed_date",
]);

// ============================================================================
// PAYMENT METHOD SCHEMAS
// ============================================================================

/**
 * Schema per Payment Term Detail
 */
export const paymentTermDetailSchema = z
  .object({
    percentage: percentageSchema,

    termType: termTypeSchema.default("days_from_invoice"),

    dueDays: z
      .number()
      .int()
      .nonnegative("dueDays deve essere >= 0")
      .default(0),

    isEndOfMonth: z.boolean().default(false),

    isFixedDate: z.boolean().default(false),

    fixedDay: z
      .number()
      .int()
      .min(1, "fixedDay deve essere >= 1")
      .max(31, "fixedDay deve essere <= 31")
      .optional()
      .nullable(),

    fixedMonthOffset: z.number().int().nonnegative().default(0),

    position: z.number().int().nonnegative().default(0),
  })
  .strict();

/**
 * Schema per Payment Method Translation
 */
export const paymentMethodTranslationSchema = z
  .object({
    languageId: createIdSchema("Language ID è obbligatorio"),

    name: z
      .string()
      .min(1, "Nome traduzione è obbligatorio")
      .max(100, "Nome traduzione non può superare 100 caratteri")
      .trim(),

    description: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema per la creazione di un Payment Method
 */
export const createPaymentMethodSchema = z
  .object({
    code: z
      .string()
      .min(1, "Codice è obbligatorio")
      .max(50, "Codice non può superare 50 caratteri")
      .trim(),

    active: z.boolean().default(true),

    position: z.number().int().nonnegative().default(0),

    translations: z
      .array(paymentMethodTranslationSchema)
      .min(1, "Almeno una traduzione è obbligatoria"),

    details: z.array(paymentTermDetailSchema).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.details && data.details.length > 0) {
        return isValidPercentageTotal(data.details);
      }
      return true;
    },
    {
      message: "La somma delle percentuali deve essere 100",
      path: ["details"],
    },
  );

/**
 * Schema per l'aggiornamento di un Payment Method
 */
export const updatePaymentMethodSchema = z
  .object({
    code: z
      .string()
      .min(1, "Codice non può essere vuoto")
      .max(50, "Codice non può superare 50 caratteri")
      .trim()
      .optional(),

    active: z.boolean().optional(),

    position: z.number().int().nonnegative().optional(),

    translations: z.array(paymentMethodTranslationSchema).optional(),
  })
  .strict();

/**
 * Schema per aggiunta/aggiornamento Payment Term Details
 */
export const updatePaymentTermDetailsSchema = z
  .object({
    details: z
      .array(paymentTermDetailSchema)
      .min(1, "Almeno un detail è obbligatorio"),
  })
  .strict()
  .refine(
    (data) => {
      if (data.details && data.details.length > 0) {
        return isValidPercentageTotal(data.details);
      }
      return true;
    },
    {
      message: "La somma delle percentuali deve essere 100",
      path: ["details"],
    },
  );

/**
 * Schema per calcolo scadenze
 */
export const calculateDueDatesSchema = z
  .object({
    invoiceDate: dateStringSchema(),
    totalAmount: z.number().positive("Total amount deve essere > 0"),
  })
  .strict();

/**
 * Schema per ID parametri
 */
export const paymentMethodIdSchema = z.object({
  id: createIdSchema("ID Payment Method non valido"),
});

/**
 * Schema per query di ricerca
 */
export const paymentQuerySchema = z
  .object({
    active: queryBooleanSchema,
    sortBy: z
      .enum(["code", "position", "createdAt"])
      .optional()
      .default("position"),
    sortOrder: sortOrderSchema,
  })
  .strict();

/**
 * Schema per toggle active status
 */
export const togglePaymentStatusSchema = z
  .object({
    active: z.boolean({ error: "Campo active è obbligatorio" }),
  })
  .strict();
