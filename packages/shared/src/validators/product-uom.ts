// packages/shared/src/validators/product-uom.ts
import { z } from "zod";
import { createDecimalSchema } from "./primitives/decimal";
import { productUomIdBaseSchema, uomIdBaseSchema } from "./base";

const uomFactorSchema = createDecimalSchema(10, {
  required: true,
  positiveOnly: true,
  min: "0.0000000001",
  messages: { min: "Il fattore deve essere maggiore di zero" },
});

/** Max fractional digits per UnitOfMeasure.decimals is enforced in the controller. */
export const createProductUomSchema = z
  .object({
    uomId: uomIdBaseSchema,
    factor: uomFactorSchema,
    isSalesDefault: z.boolean().default(false),
    isPurchaseDefault: z.boolean().default(false),
  })
  .strict();
export const updateProductUomSchema = createProductUomSchema
  .omit({ uomId: true })
  .partial()
  .strict();
export const productUomIdSchema = z.object({ id: productUomIdBaseSchema });
