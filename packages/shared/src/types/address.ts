// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import {
  addressIdSchema,
  addressQuerySchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validators";
import { Company } from "./company";
import { Country } from "./country";

/**
 * Company Address entity
 */
export type Address = z.infer<typeof createAddressSchema> & {
  id: number;
  Company: Company;
  Country: Country;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type AddressQueryInput = z.infer<typeof addressQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type AddressIdParam = z.infer<typeof addressIdSchema>;
