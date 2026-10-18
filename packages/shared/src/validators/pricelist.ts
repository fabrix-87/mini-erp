// packages/shared/src/validators/pricelist.ts
import { z } from "zod";
import { isoDateSchema } from "./primitives/date";
import { positiveNumbersSchema } from "./primitives/id";
import {
  createDecimalSchema,
  discountPercentOptionalSchema,
  nullableDecimalSchema,
  quantitySchema,
} from "./primitives/decimal";
import { queryBooleanSchema } from "./query/params";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import {
  currencyCodeBaseSchema,
  priceListIdBaseSchema,
  priceListItemIdBaseSchema,
  productVariantIdBaseSchema,
  customerIdBaseSchema,
  taxRuleIdBaseSchema,
  uomIdBaseSchema,
} from "./base";
import {
  MAX_LINE_QUANTITY,
  MAX_PRICE_LIST_BULK_ITEMS,
  MIN_POSITIVE_QUANTITY,
  MIN_POSITIVE_UNIT_PRICE,
  PRICE_LIST_ITEM_SORT_FIELDS,
  PRICE_LIST_ROUNDING_METHOD,
  PRICE_LIST_SORT_FIELDS,
  PRICE_LIST_STRATEGY,
  PRICE_LIST_TYPE,
} from "../constants";

export const priceListTypeSchema = z.enum(PRICE_LIST_TYPE);
export const priceListStrategySchema = z.enum(PRICE_LIST_STRATEGY);
export const roundingMethodSchema = z.enum(PRICE_LIST_ROUNDING_METHOD);

// ---- helpers (private) -----------------------------------------------------
const unitPriceSchema = createDecimalSchema(6, {
  required: true,
  positiveOnly: true,
  min: MIN_POSITIVE_UNIT_PRICE,
  messages: { min: "Il prezzo deve essere maggiore di zero" },
});

const checkDateRange = (data: { validFrom?: unknown; validTo?: unknown }, ctx: z.RefinementCtx) => {
  if (
    data.validFrom &&
    data.validTo &&
    new Date(String(data.validTo)) < new Date(String(data.validFrom))
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["validTo"],
      message: "La data fine deve essere successiva alla data inizio",
    });
  }
};

// quantity break, Decimal(15,6) > 0
const minQuantitySchema = createDecimalSchema(6, {
  positiveOnly: true,
  min: MIN_POSITIVE_QUANTITY,
  max: MAX_LINE_QUANTITY,
});

// ---- PriceList ---------------------------------------------------------------
const priceListBaseShape = {
  code: z.string().min(1, "Codice listino obbligatorio").max(50, "Codice max 50 caratteri").trim(),
  name: z.string().min(1, "Nome obbligatorio").max(100).trim(),
  currencyCode: currencyCodeBaseSchema,
  type: priceListTypeSchema,
  validFrom: isoDateSchema({ message: "Data inizio non valida" }).nullish(),
  validTo: isoDateSchema({ message: "Data fine non valida" }).nullish(),
  active: z.boolean(),
  isDefault: z.boolean(),
  parentListId: priceListIdBaseSchema.nullish(),
  strategy: priceListStrategySchema,
  strategyValue: createDecimalSchema(2, { positiveOnly: true, min: 0, max: "99999999.99" }),
  roundingMethod: roundingMethodSchema,
};

const checkStrategy =
  (requireParent: boolean) =>
  (
    data: { strategy?: string; parentListId?: string | null; strategyValue?: string },
    ctx: z.RefinementCtx,
  ) => {
    const derived = data.strategy !== undefined && data.strategy !== PRICE_LIST_STRATEGY.EXPLICIT;
    const parentMissing = requireParent ? !data.parentListId : data.parentListId === null;
    if (derived && parentMissing) {
      ctx.addIssue({
        code: "custom",
        path: ["parentListId"],
        message: "Una strategia derivata richiede un listino padre",
      });
    }
    if (
      data.strategy === PRICE_LIST_STRATEGY.PERCENT_DECREASE &&
      data.strategyValue !== undefined &&
      Number(data.strategyValue) > 100
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["strategyValue"],
        message: "Lo sconto percentuale non può superare 100",
      });
    }
  };

export const createPriceListSchema = z
  .object(priceListBaseShape)
  .extend({
    currencyCode: currencyCodeBaseSchema.default("EUR"),
    type: priceListTypeSchema.default("SALE"),
    active: z.boolean().default(true),
    strategy: priceListStrategySchema.default("EXPLICIT"),
    isDefault: z.boolean().default(false),
    strategyValue: createDecimalSchema(2, {
      positiveOnly: true,
      min: 0,
      max: "99999999.99",
      defaultValue: 0,
    }),
    roundingMethod: roundingMethodSchema.default("NONE"),
  })
  .strict()
  .superRefine((d, ctx) => {
    checkDateRange(d, ctx);
    checkStrategy(true)(d, ctx);
  });

/** Parent/currency compatibility and hierarchy cycles are checked in the controller. */
export const updatePriceListSchema = z
  .object(priceListBaseShape)
  .partial()
  .strict()
  .superRefine((d, ctx) => {
    checkDateRange(d, ctx);
    checkStrategy(false)(d, ctx);
  });

// ---- PriceListItem (priceListId comes from the route) -------------------------
const priceListItemBaseShape = {
  minQuantity: minQuantitySchema,
  price: unitPriceSchema,
  discountPercent: nullableDecimalSchema(discountPercentOptionalSchema),
  validFrom: isoDateSchema({ message: "Data inizio non valida" }).nullish(),
  validTo: isoDateSchema({ message: "Data fine non valida" }).nullish(),
  taxRuleId: taxRuleIdBaseSchema.nullish(),
};

export const createPriceListItemSchema = z
  .object({ variantId: productVariantIdBaseSchema, ...priceListItemBaseShape })
  .extend({
    minQuantity: createDecimalSchema(6, {
      positiveOnly: true,
      min: MIN_POSITIVE_QUANTITY,
      max: MAX_LINE_QUANTITY,
      defaultValue: 1,
    }),
  })
  .strict()
  .superRefine((d, ctx) => {
    checkDateRange(d, ctx);
    if (d.validTo && !d.validFrom) {
      ctx.addIssue({
        code: "custom",
        path: ["validFrom"],
        message: "La data fine richiede la data inizio",
      });
    }
  });

export const updatePriceListItemSchema = z
  .object(priceListItemBaseShape)
  .partial()
  .strict()
  .superRefine(checkDateRange);

export const bulkImportItemSchema = createPriceListItemSchema;

export const bulkImportBodySchema = z
  .object({
    items: z
      .array(bulkImportItemSchema)
      .min(1, "La lista non può essere vuota")
      .max(MAX_PRICE_LIST_BULK_ITEMS, `Massimo ${MAX_PRICE_LIST_BULK_ITEMS} item per import`),
  })
  .strict();

export const resolvePriceBodySchema = z
  .object({
    variantId: productVariantIdBaseSchema,
    /** Quantity expressed in the unit selected by uomId (base UoM when omitted). */
    quantity: createDecimalSchema(6, {
      positiveOnly: true,
      min: MIN_POSITIVE_QUANTITY,
      max: MAX_LINE_QUANTITY,
      defaultValue: 1,
    }),
    uomId: uomIdBaseSchema.optional(),
    priceListId: priceListIdBaseSchema.optional(),
    customerId: customerIdBaseSchema.optional(),
    /** Document currency. Required to pick the tenant default list. */
    currencyCode: currencyCodeBaseSchema.optional(),
    at: isoDateSchema({ message: "Data non valida" }).optional(),
  })
  .strict();

// ---- Query / params ------------------------------------------------------------
export const priceListQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  active: queryBooleanSchema,
  type: priceListTypeSchema.optional(),
  currencyCode: currencyCodeBaseSchema.optional(),
  validAt: isoDateSchema({ message: "Data non valida" }).optional(),
  sortBy: z.enum(PRICE_LIST_SORT_FIELDS).default("code"),
  sortOrder: sortOrderSchema,
});

export const priceListItemQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  variantId: productVariantIdBaseSchema.optional(),
  minPrice: createDecimalSchema(6),
  maxPrice: createDecimalSchema(6),
  sortBy: z.enum(PRICE_LIST_ITEM_SORT_FIELDS).default("variantId"),
  sortOrder: sortOrderSchema,
});

export const priceListIdParamSchema = z.object({ id: priceListIdBaseSchema });
export const priceListItemIdParamSchema = z.object({
  priceListId: priceListIdBaseSchema,
  id: priceListItemIdBaseSchema,
});
export const bulkPriceListIdParamSchema = z.object({ priceListId: priceListIdBaseSchema });
