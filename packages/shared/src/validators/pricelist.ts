import { z } from "zod";
import { isoDateSchema } from "./primitives/date";
import { createIdSchema, positiveNumbersSchema } from "./primitives/id";
import { createDecimalSchema } from "./primitives/decimal";
import { currencySchema, percentageSchema, priceSchema } from "./business/currency";
import { queryBooleanSchema } from "./query/params";
import { sortOrderSchema } from "./query/pagination";
import { currencyCodeBaseSchema } from "./base";


// ============================================================================
// ENUMS
// ============================================================================

export const priceListTypeSchema = z.enum([
  "SALE",
  "PURCHASE",
  "PROMOTION",
  "CONTRACT",
]);

export const priceListStrategySchema = z.enum([
  "EXPLICIT",
  "PERCENT_DECREASE",
  "PERCENT_INCREASE",
  "FIXED_DECREASE",
  "FIXED_INCREASE",
]);

export const roundingMethodSchema = z.enum([
  "none",
  "nearest_05",
  "nearest_10",
  "up",
  "down",
]);

// ============================================================================
// PRICE LIST SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Price List
 */
export const createPriceListSchema = z
  .object({
    // Identificazione
    code: z
      .string()
      .min(1, "Codice listino obbligatorio")
      .max(50, "Codice max 50 caratteri")
      .trim(),
    name: z.string().min(1, "Nome obbligatorio").max(100).trim(),
    currencyCode: currencyCodeBaseSchema,

    type: priceListTypeSchema.default("SALE"),

    // Validità
    validFrom: isoDateSchema({ message: "Data inizo non valida" }),
    validTo: isoDateSchema({ message: "Data fine non valida" }),
    active: z.boolean().default(true),

    // Ereditarietà
    parentListId: createIdSchema("Parent ID non valido"),
    strategy: priceListStrategySchema.default("EXPLICIT"),
    strategyValue: createDecimalSchema(2, {
      positiveOnly: true,
      min: 0,
      error: "Il valore deve essere >= 0",
    }),
    roundingMethod: roundingMethodSchema.default("none"),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Price List
 */
export const updatePriceListSchema = createPriceListSchema.partial().strict();

// ============================================================================
// PRICE LIST ITEM SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Price List Item
 */
export const createPriceListItemSchema = z
  .object({
    priceListId: createIdSchema("ID listino non valido"),
    variantId: createIdSchema("ID variante non valido"),

    // Scaglioni quantità
    minQuantity: positiveNumbersSchema.default(1),

    // Prezzo
    price: priceSchema({ min: 0.0001 }),
    discountPercent: percentageSchema.optional().nullable(),

    // Date specifiche per la riga
    validFrom: isoDateSchema({ message: "Data inizo non valida" }),
    validTo: isoDateSchema({ message: "Data fine non valida" }),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Price List Item
 */
export const updatePriceListItemSchema = createPriceListItemSchema.omit({
  priceListId: true,
  variantId: true,
})
  .partial()
  .strict();

/**
 * Schema per Bulk Import
 */
export const bulkImportItemSchema = z
  .object({
    variantId: createIdSchema("ID variante non valido"),
    minQuantity: positiveNumbersSchema.optional().default(1),
    price: priceSchema({ precision: 4 }),
    discountPercent: percentageSchema.optional().nullable(),
    validFrom: isoDateSchema({ message: "Data inizo non valida" }),
    validTo: isoDateSchema({ message: "Data fine non valida" }),
  })
  .strict();

export const bulkImportBodySchema = z
  .object({
    items: z
      .array(bulkImportItemSchema)
      .min(1, "La lista non può essere vuota")
      .max(1000, "Massimo 1000 item per import"),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema per query Price List
 */
export const priceListQuerySchema = z.object({
  active: queryBooleanSchema,
  type: priceListTypeSchema.optional(),
  currencyCode: currencyCodeBaseSchema,
  validAt: isoDateSchema({ message: "Data non valida" }),
  sortBy: z
    .enum(["code", "name", "type", "currency", "validFrom", "validTo"])
    .default("code"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema per query Price List Items
 */
export const priceListItemQuerySchema = z.object({
  variantId: createIdSchema("ID variante non valido"),
  minPrice: currencySchema,
  maxPrice: currencySchema,
  sortBy: z.enum(["variantId", "minQuantity", "price"]).default("variantId"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema per calcolo prezzo
 */
export const calculatePriceBodySchema = z.object({
  priceListId: createIdSchema("ID listino non valido"),
  variantId: createIdSchema("ID variante non valido"),
  quantity: positiveNumbersSchema.default(1),
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const priceListIdParamSchema = z.object({
  id: createIdSchema("ID listino non valido"),
});

export const priceListItemIdParamSchema = z.object({
  priceListId: createIdSchema("ID listino non valido")
});

export const bulkPriceListIdParamSchema = z.object({
  priceListId: createIdSchema("ID listino non valido"),
});
