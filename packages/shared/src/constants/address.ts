import { z } from "zod";
import { addressTypeSchema } from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type AddressType = z.infer<typeof addressTypeSchema>;

export const ADDRESS_TYPE = {
  LEGAL: "LEGAL",
  BILLING: "BILLING",
  SHIPPING: "SHIPPING",
  OFFICE: "OFFICE",
  WAREHOUSE: "WAREHOUSE",
  OTHER: "OTHER",
} as const;
