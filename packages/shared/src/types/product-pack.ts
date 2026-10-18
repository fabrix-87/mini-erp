// packages/shared/src/types/product-pack.ts
import { z } from "zod";
import {
  createProductPackItemSchema,
  productPackItemIdSchema,
  updateProductPackItemSchema,
} from "../validators";

export type ProductPackItem = {
  id: string;
  tenantId: string;
  packVariantId: string;
  componentVariantId: string;
  quantity: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};
export type CreateProductPackItemInput = z.infer<typeof createProductPackItemSchema>;
export type CreateProductPackItemFormValues = z.input<typeof createProductPackItemSchema>;
export type UpdateProductPackItemInput = z.infer<typeof updateProductPackItemSchema>;
export type UpdateProductPackItemFormValues = z.input<typeof updateProductPackItemSchema>;
export type ProductPackItemParam = z.infer<typeof productPackItemIdSchema>;
