// packages/shared/src/validators/product-pack.ts
import { z } from "zod";
import { createDecimalSchema } from "./primitives/decimal";
import { productPackItemIdBaseSchema, productVariantIdBaseSchema } from "./base";
import { MAX_LINE_QUANTITY, MIN_POSITIVE_QUANTITY } from "../constants";

const packQuantitySchema = createDecimalSchema(6, {
  required: true,
  positiveOnly: true,
  min: MIN_POSITIVE_QUANTITY,
  max: MAX_LINE_QUANTITY,
  messages: { min: "La quantità deve essere maggiore di zero" },
});

/** Rules needing DB access (pack product type, no nested packs, tenant match) live in the controller. */
export const createProductPackItemSchema = z
  .object({
    packVariantId: productVariantIdBaseSchema,
    componentVariantId: productVariantIdBaseSchema,
    quantity: packQuantitySchema,
    position: z.number().int().min(0).default(0),
  })
  .strict()
  .refine((d) => d.packVariantId !== d.componentVariantId, {
    path: ["componentVariantId"],
    message: "Un pack non può contenere sé stesso",
  });

export const updateProductPackItemSchema = z
  .object({ quantity: packQuantitySchema, position: z.number().int().min(0) })
  .partial()
  .strict();

export const productPackItemIdSchema = z.object({ id: productPackItemIdBaseSchema });
