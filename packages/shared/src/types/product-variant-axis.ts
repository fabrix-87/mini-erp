// packages/shared/src/types/product-variant-axis.ts
import { z } from "zod";
import { AttributeGroup } from "./attribute";
import {
  createProductVariantAxisSchema,
  productVariantAxisParamSchema,
  reorderProductVariantAxesSchema,
  updateProductVariantAxisSchema,
} from "../validators/product-variant-axis";

export type ProductVariantAxis = {
  tenantId: string;
  productId: string;
  attributeGroupId: string;
  position: number;
  attributeGroup?: AttributeGroup;
};
export type CreateProductVariantAxisInput = z.infer<typeof createProductVariantAxisSchema>;
export type UpdateProductVariantAxisInput = z.infer<typeof updateProductVariantAxisSchema>;
export type ReorderProductVariantAxesInput = z.infer<typeof reorderProductVariantAxesSchema>;
export type ProductVariantAxisParam = z.infer<typeof productVariantAxisParamSchema>;
