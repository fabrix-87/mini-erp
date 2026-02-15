// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import {
  addressIdSchema,
  addressQuerySchema,
  addressTypeSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validators";

// Tipi ENUM
export type AddressType = z.infer<typeof addressTypeSchema>;

/**
 * Tipo Address
 */
export type Address = z.infer<typeof createAddressSchema> & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type AddressQueryInput = z.infer<typeof addressQuerySchema>;
export type AddressIdInput = z.infer<typeof addressIdSchema>;
