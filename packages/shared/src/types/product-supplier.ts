// packages/shared/src/types/product-supplier.ts
import { z } from "zod";
import { ProductVariant } from "./product";
import { Currency } from "./currency";
import {
  createProductSupplierSchema,
  productSupplierIdSchema,
  updateProductSupplierSchema,
} from "../validators";

export type ProductSupplier = {
  variant: ProductVariant;
  supplier: ProductSupplier;
  supplierSku: string;
  purchasePrice: string;
  currency: Currency;
  minOrderQty: string;
  leadTimeDays: number;
  isPreferred: boolean;
};

export type CreateProductSupplierInput = z.infer<typeof createProductSupplierSchema>;
export type UpdateProductSupplierInput = z.infer<typeof updateProductSupplierSchema>;
export type ProductSupplierIdParam = z.infer<typeof productSupplierIdSchema>;
