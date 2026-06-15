import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { createDecimalSchema } from "./primitives/decimal";
import { isoDateSchema } from "./primitives/date";

import { sortOrderSchema, pageSchema, limitSchema } from "./query/pagination";
import { queryBooleanSchema, queryNumberSchema } from "./query/params";
import {
  WAREHOUSE_TYPES,
  MOVEMENT_TYPES,
  MOVEMENT_STATUS,
  VIRTUAL_SYNC_STATUS,
  STOCK_BATCH_STATUS,
  STOCK_RESERVATION_STATUS,
  MAX_MOVEMENT_QUANTITY,
  MIN_MOVEMENT_QUANTITY,
  MAX_BATCH_NUMBER_LENGTH,
  MAX_SERIAL_NUMBER_LENGTH,
  MAX_LEAD_TIME_DAYS,
  DEFAULT_RESERVATION_EXPIRY_MINUTES,
} from "../constants/warehouse";
import { currencyCodeBaseSchema } from "./base";

// ============================================================================
// ENUMS
// ============================================================================

export const warehouseTypeSchema = z.enum([
  WAREHOUSE_TYPES.PHYSICAL,
  WAREHOUSE_TYPES.VIRTUAL,
]);

export const movementTypeSchema = z.enum([
  MOVEMENT_TYPES.PURCHASE,
  MOVEMENT_TYPES.SALE,
  MOVEMENT_TYPES.RETURN_IN,
  MOVEMENT_TYPES.RETURN_OUT,
  MOVEMENT_TYPES.ADJUSTMENT_IN,
  MOVEMENT_TYPES.ADJUSTMENT_OUT,
  MOVEMENT_TYPES.TRANSFER_IN,
  MOVEMENT_TYPES.TRANSFER_OUT,
  MOVEMENT_TYPES.INVENTORY_START,
]);

export const movementStatusSchema = z.enum([
  MOVEMENT_STATUS.PENDING,
  MOVEMENT_STATUS.CONFIRMED,
  MOVEMENT_STATUS.CANCELLED,
]);

export const virtualSyncStatusSchema = z.enum([
  VIRTUAL_SYNC_STATUS.PENDING,
  VIRTUAL_SYNC_STATUS.SUCCESS,
  VIRTUAL_SYNC_STATUS.ERROR,
]);

export const stockBatchStatusSchema = z.enum([
  STOCK_BATCH_STATUS.ACTIVE,
  STOCK_BATCH_STATUS.QUARANTINE,
  STOCK_BATCH_STATUS.EXPIRED,
]);

export const stockReservationStatusSchema = z.enum([
  STOCK_RESERVATION_STATUS.ACTIVE,
  STOCK_RESERVATION_STATUS.FULFILLED,
  STOCK_RESERVATION_STATUS.CANCELLED,
  STOCK_RESERVATION_STATUS.EXPIRED,
]);

// ============================================================================
// DECIMAL HELPERS
// ============================================================================

const unitCostSchema = createDecimalSchema(6, {
  positiveOnly: true,
  min: 0,
});

const totalCostSchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: 0,
});

const supplierPriceSchema = createDecimalSchema(6, {
  positiveOnly: true,
  min: 0,
});

// ============================================================================
// WAREHOUSE SCHEMAS
// ============================================================================

export const warehouseIdSchema = createIdSchema("ID Warehouse non valido");

export const createWarehouseSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome obbligatorio")
      .max(255, "Nome max 255 caratteri")
      .trim(),

    location: z.string().max(500).optional().nullable(),

    type: warehouseTypeSchema.default(WAREHOUSE_TYPES.PHYSICAL),
  })
  .strict();

export const updateWarehouseSchema = createWarehouseSchema.partial().strict();

// ============================================================================
// STOCK MOVEMENT SCHEMAS
// ============================================================================

export const stockMovementIdSchema = createIdSchema(
  "ID Stock Movement non valido",
);

/**
 * Raw object shape for StockMovement — no refinements.
 */
const stockMovementShape = z.object({
  productVariantId: createIdSchema("Product Variant ID non valido"),
  warehouseId: warehouseIdSchema,

  quantity: z
    .number()
    .int("Quantità deve essere un intero")
    .min(MIN_MOVEMENT_QUANTITY, `Quantità minima ${MIN_MOVEMENT_QUANTITY}`)
    .max(MAX_MOVEMENT_QUANTITY, `Quantità massima ${MAX_MOVEMENT_QUANTITY}`)
    .refine((val) => val !== 0, "Quantità non può essere zero"),

  movementType: movementTypeSchema,
  referenceId: z.string().max(100).optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
  movementDate: isoDateSchema().default(() => new Date().toISOString()),
  unitCost: unitCostSchema.optional().nullable(),
  totalCost: totalCostSchema.optional().nullable(),
  documentId: createIdSchema("Document ID non valido").optional().nullable(),
  documentLineId: createIdSchema("Document Line ID non valido")
    .optional()
    .nullable(),
  batchNumber: z.string().max(MAX_BATCH_NUMBER_LENGTH).optional().nullable(),
  serialNumber: z.string().max(MAX_SERIAL_NUMBER_LENGTH).optional().nullable(),
  expiryDate: isoDateSchema(),
  status: movementStatusSchema.default(MOVEMENT_STATUS.PENDING),
});

/**
 * Schema for creating a StockMovement — includes cross-field cost validation.
 */
export const createStockMovementSchema = stockMovementShape.strict().refine(
  (data) => {
    if (data.totalCost && !data.unitCost) return false;
    return true;
  },
  {
    message: "Unit cost obbligatorio se total cost è specificato",
    path: ["unitCost"],
  },
);

/**
 * Schema for updating a StockMovement — partial, immutable fields excluded.
 * productVariantId, warehouseId and movementType cannot change after creation.
 */
export const updateStockMovementSchema = stockMovementShape
  .omit({ productVariantId: true, warehouseId: true, movementType: true })
  .partial()
  .strict();

export const confirmStockMovementSchema = z
  .object({
    movementDate: isoDateSchema().optional(),
    note: z.string().max(1000).optional().nullable(),
  })
  .strict();

export const cancelStockMovementSchema = z
  .object({
    reason: z.string().min(1, "Motivo obbligatorio").max(500),
  })
  .strict();

export const bulkConfirmMovementsSchema = z
  .object({
    movementIds: z
      .array(stockMovementIdSchema)
      .min(1, "Seleziona almeno un movimento"),
    movementDate: isoDateSchema().optional(),
  })
  .strict();

// ============================================================================
// VIRTUAL STOCK SCHEMAS
// ============================================================================

export const virtualStockIdSchema = createIdSchema(
  "ID Virtual Stock non valido",
);

/**
 * Raw object shape for VirtualStock — no refinements.
 */
const virtualStockShape = z.object({
  productVariantId: createIdSchema("Product Variant ID non valido"),
  warehouseId: warehouseIdSchema,

  quantity: z
    .number()
    .int("Quantità deve essere un intero")
    .nonnegative("Quantità non può essere negativa"),

  source: z.string().max(100).optional().nullable(),
  expectedAvailableDate: isoDateSchema(),

  leadTimeDays: z
    .number()
    .int("Lead time deve essere un intero")
    .nonnegative("Lead time non può essere negativo")
    .max(MAX_LEAD_TIME_DAYS, `Lead time massimo ${MAX_LEAD_TIME_DAYS} giorni`)
    .default(0),

  supplierPrice: supplierPriceSchema.optional().nullable(),
  supplierCurrencyCode: currencyCodeBaseSchema.optional().nullable(),
});

/**
 * Schema for creating a VirtualStock — includes supplier price/currency validation.
 */
export const createVirtualStockSchema = virtualStockShape.strict().refine(
  (data) => {
    if (data.supplierPrice && !data.supplierCurrencyCode) return false;
    return true;
  },
  {
    message: "Valuta fornitore obbligatoria se prezzo specificato",
    path: ["supplierCurrencyCode"],
  },
);

/**
 * Schema for updating a VirtualStock — partial, immutable FK fields excluded.
 */
export const updateVirtualStockSchema = virtualStockShape
  .omit({ productVariantId: true, warehouseId: true })
  .partial()
  .strict();

export const syncVirtualStockSchema = z
  .object({
    quantity: z.number().int().nonnegative(),
    supplierPrice: supplierPriceSchema.optional().nullable(),
    expectedAvailableDate: isoDateSchema(),
    leadTimeDays: z
      .number()
      .int()
      .nonnegative()
      .max(MAX_LEAD_TIME_DAYS)
      .optional(),
  })
  .strict();

export const markSyncErrorSchema = z
  .object({
    error: z.string().min(1, "Messaggio errore obbligatorio").max(5000),
  })
  .strict();

// ============================================================================
// STOCK BATCH SCHEMAS
// ============================================================================

export const stockBatchIdSchema = createIdSchema("ID Stock Batch non valido");

/**
 * Raw object shape for StockBatch — no refinements.
 */
const stockBatchShape = z.object({
  productVariantId: createIdSchema("Product Variant ID non valido"),

  batchNumber: z
    .string()
    .min(1, "Batch number obbligatorio")
    .max(MAX_BATCH_NUMBER_LENGTH)
    .trim(),

  manufacturedDate: isoDateSchema(),
  expiryDate: isoDateSchema(),
  supplierId: createIdSchema("Supplier ID non valido").optional().nullable(),

  quantity: z.number().int().nonnegative("Quantità non può essere negativa"),

  reserved: z
    .number()
    .int()
    .nonnegative("Reserved non può essere negativo")
    .default(0),

  status: stockBatchStatusSchema.default(STOCK_BATCH_STATUS.ACTIVE),
});

/**
 * Schema for creating a StockBatch — includes expiry/manufactured date validation.
 */
export const createStockBatchSchema = stockBatchShape.strict().refine(
  (data) => {
    if (data.manufacturedDate && data.expiryDate) {
      return new Date(data.expiryDate) > new Date(data.manufacturedDate);
    }
    return true;
  },
  {
    message: "Data scadenza deve essere successiva alla data produzione",
    path: ["expiryDate"],
  },
);

/**
 * Schema for updating a StockBatch — partial, immutable fields excluded.
 * productVariantId and batchNumber cannot change after creation.
 */
export const updateStockBatchSchema = stockBatchShape
  .omit({ productVariantId: true, batchNumber: true })
  .partial()
  .strict();

export const adjustBatchQuantitySchema = z
  .object({
    quantity: z.number().int(),
    reason: z.string().min(1, "Motivo obbligatorio").max(500),
  })
  .strict();

// ============================================================================
// STOCK RESERVATION SCHEMAS
// ============================================================================

export const stockReservationIdSchema = createIdSchema(
  "ID Stock Reservation non valido",
);

export const createStockReservationSchema = z
  .object({
    productVariantId: createIdSchema("Product Variant ID non valido"),

    warehouseId: warehouseIdSchema,

    quantity: z
      .number()
      .int("Quantità deve essere un intero")
      .positive("Quantità deve essere positiva"),

    documentId: createIdSchema("Document ID non valido"),

    documentLineId: createIdSchema("Document Line ID non valido")
      .optional()
      .nullable(),

    expiresAt: isoDateSchema().optional(),

    batchNumber: z.string().max(MAX_BATCH_NUMBER_LENGTH).optional().nullable(),

    expiryMinutes: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_RESERVATION_EXPIRY_MINUTES),
  })
  .strict()
  .transform((data) => {
    // Auto-calculate expiresAt if not provided
    if (!data.expiresAt) {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + data.expiryMinutes);
      return {
        ...data,
        expiresAt: expiresAt.toISOString(),
      };
    }
    return data;
  });

export const fulfillReservationSchema = z
  .object({
    actualQuantity: z.number().int().positive().optional(),
    note: z.string().max(500).optional().nullable(),
  })
  .strict();

export const cancelReservationSchema = z
  .object({
    reason: z.string().min(1, "Motivo obbligatorio").max(500),
  })
  .strict();

export const extendReservationSchema = z
  .object({
    additionalMinutes: z
      .number()
      .int()
      .positive("Minuti aggiuntivi devono essere positivi")
      .max(1440, "Massimo 24 ore di estensione"),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const warehouseQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  type: warehouseTypeSchema.optional(),
  sortBy: z.enum(["name", "location", "type", "createdAt"]).default("name"),
  sortOrder: sortOrderSchema,
});

export const stockMovementQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  productVariantId: createIdSchema("Product Variant ID non valido").optional(),
  warehouseId: warehouseIdSchema.optional(),
  movementType: movementTypeSchema.optional(),
  status: movementStatusSchema.optional(),
  documentId: createIdSchema("Document ID non valido").optional(),
  batchNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  hasCost: queryBooleanSchema,
  sortBy: z
    .enum(["movementDate", "quantity", "movementType", "status", "createdAt"])
    .default("movementDate"),
  sortOrder: sortOrderSchema,
});

export const virtualStockQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  productVariantId: createIdSchema("Product Variant ID non valido").optional(),
  warehouseId: warehouseIdSchema.optional(),
  syncStatus: virtualSyncStatusSchema.optional(),
  minQuantity: queryNumberSchema("Quantità minima non valida")
    .pipe(z.number().int().nonnegative().optional())
    .optional(),
  maxQuantity: queryNumberSchema("Quantità massima non valida")
    .pipe(z.number().int().nonnegative().optional())
    .optional(),
  hasPrice: queryBooleanSchema,
  sortBy: z
    .enum(["quantity", "lastSyncAt", "expectedAvailableDate", "updatedAt"])
    .default("updatedAt"),
  sortOrder: sortOrderSchema,
});

export const stockBatchQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  productVariantId: createIdSchema("Product Variant ID non valido").optional(),
  supplierId: createIdSchema("Supplier ID non valido").optional(),
  status: stockBatchStatusSchema.optional(),
  expiryFrom: isoDateSchema(),
  expiryTo: isoDateSchema(),
  expiringSoon: z.boolean().optional(), // Expiring in next 30 days
  sortBy: z
    .enum([
      "batchNumber",
      "expiryDate",
      "quantity",
      "status",
      "manufacturedDate",
    ])
    .default("expiryDate"),
  sortOrder: sortOrderSchema,
});

export const stockReservationQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  productVariantId: createIdSchema("Product Variant ID non valido").optional(),
  warehouseId: warehouseIdSchema.optional(),
  documentId: createIdSchema("Document ID non valido").optional(),
  status: stockReservationStatusSchema.optional(),
  expired: queryBooleanSchema,
  expiringFrom: isoDateSchema(),
  expiringTo: isoDateSchema(),
  sortBy: z
    .enum(["reservedAt", "expiresAt", "quantity", "status"])
    .default("reservedAt"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const warehouseIdParamSchema = z.object({
  id: warehouseIdSchema,
});

export const stockMovementIdParamSchema = z.object({
  id: stockMovementIdSchema,
});

export const virtualStockIdParamSchema = z.object({
  id: virtualStockIdSchema,
});

export const stockBatchIdParamSchema = z.object({
  id: stockBatchIdSchema,
});

export const stockReservationIdParamSchema = z.object({
  id: stockReservationIdSchema,
});

// ============================================================================
// STATISTICS SCHEMAS
// ============================================================================

export const stockLevelQuerySchema = z.object({
  warehouseId: warehouseIdSchema.optional(),
  productVariantId: createIdSchema("Product Variant ID non valido").optional(),
  lowStock: queryBooleanSchema,
  outOfStock: queryBooleanSchema,
});

export const stockValuationQuerySchema = z.object({
  warehouseId: warehouseIdSchema.optional(),
  dateAt: isoDateSchema().optional(),
  groupBy: z.enum(["warehouse", "product", "category"]).default("warehouse"),
});

export const stockMovementReportSchema = z.object({
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  warehouseId: warehouseIdSchema.optional(),
  movementTypes: z.array(movementTypeSchema).optional(),
  groupBy: z.enum(["day", "week", "month", "movementType"]).default("day"),
});
