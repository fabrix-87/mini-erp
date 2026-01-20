// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import { AddressIdSchema, AddressQuerySchema, AddressTypeSchema, CreateAddressSchema, UpdateAddressSchema } from "../validators";

// Tipi ENUM
export type AddressType = z.infer<typeof AddressTypeSchema>

/**
 * Tipo Address
 */
export type Address = z.infer<typeof CreateAddressSchema> & {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;
export type AddressQueryInput = z.infer<typeof AddressQuerySchema>;
export type AddressIdInput = z.infer<typeof AddressIdSchema>