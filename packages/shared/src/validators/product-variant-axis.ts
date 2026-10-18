// packages/shared/src/validators/product-variant-axis.ts
import { z } from "zod";
import {
  attributeGroupIdBaseSchema,
  attributeIdBaseSchema,
  productIdBaseSchema,
  productVariantIdBaseSchema,
} from "./base";
import { MAX_PRODUCT_VARIANT_AXES } from "../constants";

const axisPositionSchema = z.number().int().min(0, "La posizione non può essere negativa");

/** Axis payload nested in createProductSchema (productId is implicit). */
export const productVariantAxisInputSchema = z
  .object({
    attributeGroupId: attributeGroupIdBaseSchema,
    position: axisPositionSchema.default(0),
  })
  .strict();

/**
 * Adds an axis to an existing product (POST /products/:id/axes).
 * When the product already has variants, `assignments` must cover every non-deleted variant;
 * the controller verifies coverage, group/attribute match and the max axes limit in one transaction.
 */
export const createProductVariantAxisSchema = z
  .object({
    attributeGroupId: attributeGroupIdBaseSchema,
    position: axisPositionSchema.default(0),
    assignments: z
      .array(
        z
          .object({ variantId: productVariantIdBaseSchema, attributeId: attributeIdBaseSchema })
          .strict(),
      )
      .default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    const ids = data.assignments.map((a) => a.variantId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        path: ["assignments"],
        message: "Una sola assegnazione per variante",
      });
    }
  });

/** attributeGroupId is part of the primary key and cannot change. */
export const updateProductVariantAxisSchema = z.object({ position: axisPositionSchema }).strict();

/** Ordered list of attributeGroupIds; position is set to the array index. */
export const reorderProductVariantAxesSchema = z
  .object({
    attributeGroupIds: z
      .array(attributeGroupIdBaseSchema)
      .min(1)
      .max(MAX_PRODUCT_VARIANT_AXES)
      .refine((ids) => new Set(ids).size === ids.length, "Gruppi duplicati"),
  })
  .strict();

export const productVariantAxisParamSchema = z.object({
  id: productIdBaseSchema,
  attributeGroupId: attributeGroupIdBaseSchema,
});
