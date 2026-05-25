import { z } from "zod";
import {
  creditCheckStatusSchema,
  customerPrioritySchema,
  customerSegmentSchema,
  customerSizeSchema,
  customerTypeSchema,
} from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type CustomerType = z.infer<typeof customerTypeSchema>;
export type CustomerPriority = z.infer<typeof customerPrioritySchema>;
export type CustomerSegment = z.infer<typeof customerSegmentSchema>;
export type CreditCheckStatus = z.infer<typeof creditCheckStatusSchema>;
export type CustomerSize = z.infer<typeof customerSizeSchema>;

export const CustomerType = customerTypeSchema.enum;
export const CustomerPriority = customerPrioritySchema.enum;
export const CustomerSegment = customerSegmentSchema.enum;
export const CreditCheckStatus = creditCheckStatusSchema.enum;
export const CustomerSize = customerSizeSchema.enum;
