import { z } from "zod";
import {
  createDecimalSchema,
  createIdSchema,
  isoDateSchema,
  PercentageSchema,
  positiveNumbersSchema,
  priceSchema,
  QueryBooleanSchema,
  sortOrderSchema,
} from "../utils";

// ============================================================================
// ENUMS
// ============================================================================

export const PriceListTypeSchema = z.enum([
  "SALE",
  "PURCHASE",
  "PROMOTION",
  "CONTRACT",
]);

export const PriceListStrategySchema = z.enum([
  "EXPLICIT",
  "PERCENT_DECREASE",
  "PERCENT_INCREASE",
  "FIXED_DECREASE",
  "FIXED_INCREASE",
]);

export const RoundingMethodSchema = z.enum([
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
export const CreatePriceListSchema = z
  .object({
    // Identificazione
    code: z
      .string()
      .min(1, "Codice listino obbligatorio")
      .max(50, "Codice max 50 caratteri")
      .trim(),
    name: z.string().min(1, "Nome obbligatorio").max(100).trim(),
    currency: z
      .string()
      .length(3, "Valuta deve essere codice ISO a 3 caratteri")
      .default("EUR"),

    type: PriceListTypeSchema.default("SALE"),

    // Validità
    validFrom: isoDateSchema({ message: "Data inizo non valida" }),
    validTo: isoDateSchema({ message: "Data fine non valida" }),
    active: z.boolean().default(true),

    // Ereditarietà
    parentListId: createIdSchema("Parent ID non valido"),
    strategy: PriceListStrategySchema.default("EXPLICIT"),
    strategyValue: createDecimalSchema(2, {
      positiveOnly: true,
      min: 0,
      error: "Il valore deve essere >= 0",
    }),
    roundingMethod: RoundingMethodSchema.default("none"),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Price List
 */
export const UpdatePriceListSchema = CreatePriceListSchema.partial().strict();

// ============================================================================
// PRICE LIST ITEM SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Price List Item
 */
export const CreatePriceListItemSchema = z
  .object({
    priceListId: createIdSchema("ID listino non valido"),
    variantId: createIdSchema("ID variante non valido"),

    // Scaglioni quantità
    minQuantity: positiveNumbersSchema.default(1),

    // Prezzo
    price: priceSchema({ min: 0.0001 }),
    discountPercent: PercentageSchema.optional().nullable(),

    // Date specifiche per la riga
    validFrom: isoDateSchema({ message: "Data inizo non valida" }),
    validTo: isoDateSchema({ message: "Data fine non valida" }),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Price List Item
 */
export const UpdatePriceListItemSchema = CreatePriceListItemSchema.omit({
  priceListId: true,
  variantId: true,
})
  .partial()
  .strict();

/**
 * Schema per Bulk Import
 */
export const BulkImportItemSchema = z
  .object({
    variantId: createIdSchema("ID variante non valido"),
    minQuantity: positiveNumbersSchema.optional().default(1),
    price: priceSchema({ precision: 4 }),
    discountPercent: PercentageSchema.optional().nullable(),
    validFrom: isoDateSchema({ message: "Data inizo non valida" }),
    validTo: isoDateSchema({ message: "Data fine non valida" }),
  })
  .strict();

export const BulkImportBodySchema = z
  .object({
    items: z
      .array(BulkImportItemSchema)
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
export const PriceListQuerySchema = z.object({
  active: QueryBooleanSchema,
  type: PriceListTypeSchema.optional(),
  currency: z.string().length(3).optional(),
  validAt: isoDateSchema({ message: "Data non valida" }),
  sortBy: z
    .enum(["code", "name", "type", "currency", "validFrom", "validTo"])
    .default("code"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema per query Price List Items
 */
export const PriceListItemQuerySchema = z.object({
  variantId: createIdSchema("ID variante non valido"),
  minPrice: priceSchema(),
  maxPrice: priceSchema(),
  sortBy: z.enum(["variantId", "minQuantity", "price"]).default("variantId"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema per calcolo prezzo
 */
export const CalculatePriceBodySchema = z.object({
  priceListId: createIdSchema("ID listino non valido"),
  variantId: createIdSchema("ID variante non valido"),
  quantity: positiveNumbersSchema.default(1),
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const PriceListIdParamSchema = z.object({
  id: createIdSchema("ID listino non valido"),
});

export const PriceListItemIdParamSchema = z.object({
  priceListId: createIdSchema("ID listino non valido")
});

export const BulkPriceListIdParamSchema = z.object({
  priceListId: createIdSchema("ID listino non valido"),
});
