import {z} from "zod";
import { addressTypeSchema } from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type AddressType = z.infer<typeof addressTypeSchema>;

export const AddressTypeEnum = {
  LEGAL: "LEGAL" as AddressType,
  BILLING: "BILLING" as AddressType,
  SHIPPING: "SHIPPING" as AddressType,
  OFFICE: "OFFICE" as AddressType,
  WAREHOUSE: "WAREHOUSE" as AddressType,
  OTHER: "OTHER" as AddressType,
};