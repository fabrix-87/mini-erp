// packages/shared/src/types/uom.ts
import { z } from "zod";
import { UomCategory } from "../constants/uom";
import { createProductUomSchema, productUomIdSchema, updateProductUomSchema } from "../validators";

export type Uom = {
  code: string;
  name: string;
  uneceCode: string;
  category: UomCategory;
  isBase: boolean;
  factor: string;
  decimals: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductUom = {
  uom: Uom;
  factor: string;
  isSalesDefault: boolean;
  isPurchaseDefault: boolean;
};

export type CreateProductUomInput = z.infer<typeof createProductUomSchema>;
export type UpdateProductUomInput = z.infer<typeof updateProductUomSchema>;
export type ProductUomIdParam = z.infer<typeof productUomIdSchema>;
