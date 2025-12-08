import { z } from "zod";

import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { Decimal } from "@prisma/client/runtime/client";

// ============================================================================
// ENUMS
// ============================================================================

const PriceListTypeSchema = z.enum([
  "SALE",
  "PURCHASE",
  "PROMOTION",
  "CONTRACT",
]);

const PriceListStrategySchema = z.enum([
  "EXPLICIT",
  "PERCENT_DECREASE",
  "PERCENT_INCREASE",
  "FIXED_DECREASE",
  "FIXED_INCREASE",
]);

const RoundingMethodSchema = z.enum([
  "none",
  "nearest_05",
  "nearest_10",
  "up",
  "down",
]);

// ============================================================================
// DECIMAL HELPERS
// ============================================================================

/**
 * Schema per Decimal(10, 2) - Strategy Value
 */
const StrategyValueSchema = z
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
const PriceSchema = z
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
 * Schema per Decimal(5, 2) - Percentuale sconto
 */
const DiscountPercentSchema = z
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
    validFrom: z.iso
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
    validTo: z.iso
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
    active: z.boolean().default(true),

    // Ereditarietà
    parentListId: z.number().int().positive().optional().nullable(),
    strategy: PriceListStrategySchema.default("EXPLICIT"),
    strategyValue: StrategyValueSchema,
    roundingMethod: RoundingMethodSchema.default("none"),
  })
  .strict()
  .refine(
    (data) => {
      // Se strategy != EXPLICIT, deve avere parentListId
      if (data.strategy !== "EXPLICIT" && !data.parentListId) {
        return false;
      }
      return true;
    },
    {
      message:
        "Le strategie derivate richiedono un listino padre (parentListId)",
      path: ["parentListId"],
    }
  )
  .refine(
    (data) => {
      // Se strategy != EXPLICIT, strategyValue deve essere > 0
      if (data.strategy !== "EXPLICIT") {
        return data.strategyValue.greaterThan(0);
      }
      return true;
    },
    {
      message: "Le strategie di ricarico/sconto richiedono un valore > 0",
      path: ["strategyValue"],
    }
  )
  .refine(
    (data) => {
      // validTo deve essere dopo validFrom
      if (data.validFrom && data.validTo) {
        return new Date(data.validTo) > new Date(data.validFrom);
      }
      return true;
    },
    {
      message:
        "La data di fine validità deve essere successiva alla data di inizio",
      path: ["validTo"],
    }
  );

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
    priceListId: z.number().int().positive("ID listino non valido"),
    variantId: z.number().int().positive("ID variante non valido"),

    // Scaglioni quantità
    minQuantity: z
      .number()
      .int()
      .positive("Quantità minima deve essere > 0")
      .default(1),

    // Prezzo
    price: PriceSchema,
    discountPercent: DiscountPercentSchema,

    // Date specifiche per la riga
    validFrom: z.iso
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
    validTo: z.iso
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
  })
  .strict()
  .refine(
    (data) => {
      // validTo deve essere dopo validFrom
      if (data.validFrom && data.validTo) {
        return new Date(data.validTo) > new Date(data.validFrom);
      }
      return true;
    },
    {
      message:
        "La data di fine validità deve essere successiva alla data di inizio",
      path: ["validTo"],
    }
  );

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
    variantId: z.number().int().positive("ID variante non valido"),
    minQuantity: z.number().int().positive().optional().default(1),
    price: PriceSchema,
    discountPercent: DiscountPercentSchema,
    validFrom: z.iso
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
    validTo: z.iso
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
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
  active: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  type: PriceListTypeSchema.optional(),
  currency: z.string().length(3).optional(),
  validAt: z.iso
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  sortBy: z
    .enum(["code", "name", "type", "currency", "validFrom", "validTo"])
    .default("code"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Schema per query Price List Items
 */
export const PriceListItemQuerySchema = z.object({
  variantId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/)
    .optional()
    .transform((val) => (val ? new Decimal(val) : undefined)),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/)
    .optional()
    .transform((val) => (val ? new Decimal(val) : undefined)),
  sortBy: z.enum(["variantId", "minQuantity", "price"]).default("variantId"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Schema per calcolo prezzo
 */
export const CalculatePriceBodySchema = z.object({
  priceListId: z.number().int().positive("ID listino non valido"),
  variantId: z.number().int().positive("ID variante non valido"),
  quantity: z.number().int().positive("Quantità deve essere > 0").default(1),
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const PriceListIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive("ID listino non valido")),
});

export const PriceListItemIdParamSchema = z.object({
  priceListId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive("ID listino non valido")),
  itemId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive("ID item non valido")),
});

export const BulkPriceListIdParamSchema = z.object({
  priceListId: z.string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().positive("ID listino non valido")),
});

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

export const validateCreatePriceList = validateBody(
  CreatePriceListSchema,
  "Price list creation"
);

export const validateUpdatePriceList = validateBody(
  UpdatePriceListSchema,
  "Price list update"
);

export const validateCreatePriceListItem = validateBody(
  CreatePriceListItemSchema,
  "Price list item creation"
);

export const validateUpdatePriceListItem = validateBody(
  UpdatePriceListItemSchema,
  "Price list item update"
);

export const validateBulkImportItems = validateBody(
  BulkImportBodySchema,
  "Bulk import items"
);

export const validateCalculatePrice = validateBody(
  CalculatePriceBodySchema,
  "Calculate price"
);

export const validatePriceListId = validateParams(
  PriceListIdParamSchema,
  "Price List ID"
);

export const validatePriceListItemId = validateParams(
  PriceListItemIdParamSchema,
  "Price List Item ID"
);

export const validateBulkPriceListId = validateParams(
  BulkPriceListIdParamSchema,
  "Bulk Price List ID"
);

export const validatePriceListQuery = validateQuery(
  PriceListQuerySchema,
  "Price List query"
);

export const validatePriceListItemQuery = validateQuery(
  PriceListItemQuerySchema,
  "Price List Item query"
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PriceListType = z.infer<typeof PriceListTypeSchema>;
export type PriceListStrategy = z.infer<typeof PriceListStrategySchema>;
export type RoundingMethod = z.infer<typeof RoundingMethodSchema>;

export type CreatePriceListInput = z.infer<typeof CreatePriceListSchema>;
export type UpdatePriceListInput = z.infer<typeof UpdatePriceListSchema>;
export type CreatePriceListItemInput = z.infer<
  typeof CreatePriceListItemSchema
>;
export type UpdatePriceListItemInput = z.infer<
  typeof UpdatePriceListItemSchema
>;
export type BulkImportInput = z.infer<typeof BulkImportBodySchema>;
export type CalculatePriceInput = z.infer<typeof CalculatePriceBodySchema>;

export type PriceListQueryInput = z.infer<typeof PriceListQuerySchema>;
export type PriceListItemQueryInput = z.infer<typeof PriceListItemQuerySchema>;
