// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import { Product } from "./product";
import {
  createManufacturerSchema,
  updateManufacturerSchema,
} from "../validators";
import {
  manufacturerIdParamSchema,
  manufacturerQuerySchema,
} from "../validators/manufacturer";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Manufacturer entity
 */
export type Manufacturer = {
  id: number;
  name: string;

  active: boolean;

  customFields: string; //Json

  createdAt: Date;
  updatedAt: Date;

  products?: Product[];
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================
export type CreateManufacturerInput = z.infer<typeof createManufacturerSchema>;
export type UpdateManufacturerInput = z.infer<typeof updateManufacturerSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================
export type ManufacturerQueryInput = z.infer<typeof manufacturerQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================
export type ManufacturerIdParam = z.infer<typeof manufacturerIdParamSchema>;
