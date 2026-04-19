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
import { AddressType } from "../constants";

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

/**
 * Address input data for nested create/update operations.
 * Does not include companyId (resolved by Prisma nested write).
 */
export interface CompanyAddressInput {
  address: string;
  city: string;
  provinceCode?: string;
  zipCode: string;
  countryCode: string;
  isLegal?: boolean;
  isPrimary?: boolean;
  addressType?: AddressType;
}

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
