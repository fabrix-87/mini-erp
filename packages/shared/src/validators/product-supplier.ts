// packages/shared/src/validators/product-supplier.ts
import { z } from "zod";
import {
  createDecimalSchema,
  nullableDecimalSchema,
  quantityOptionalSchema,
} from "./primitives/decimal";
import {
  currencyCodeBaseSchema,
  productSupplierIdBaseSchema,
  productVariantIdBaseSchema,
  supplierIdBaseSchema,
} from "./base";

const supplierBaseShape = {
  supplierSku: z.string().max(64).nullish(),
  purchasePrice: createDecimalSchema(6, { required: true, positiveOnly: true, min: 0 }),
  currencyCode: currencyCodeBaseSchema,
  minOrderQty: nullableDecimalSchema(quantityOptionalSchema),
  leadTimeDays: z.number().int().min(0).nullish(),
  isPreferred: z.boolean(),
};

/** Setting isPreferred demotes the previous preferred row in the same prisma.$transaction(). */
export const createProductSupplierSchema = z
  .object({
    variantId: productVariantIdBaseSchema,
    supplierId: supplierIdBaseSchema,
    ...supplierBaseShape,
  })
  .extend({
    currencyCode: currencyCodeBaseSchema.default("EUR"),
    isPreferred: z.boolean().default(false),
  })
  .strict();

/** variantId and supplierId are immutable. */
export const updateProductSupplierSchema = z.object(supplierBaseShape).partial().strict();
export const productSupplierIdSchema = z.object({ id: productSupplierIdBaseSchema });
