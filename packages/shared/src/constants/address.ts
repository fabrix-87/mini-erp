import {z} from "zod";
import { addressTypeSchema } from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type AddressType = z.infer<typeof addressTypeSchema>;

export const AddressType = addressTypeSchema.enum;