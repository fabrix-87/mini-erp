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

export const CUSTOMER_TYPE = {
  OTHER: "OTHER",
  PROSPECT: "PROSPECT",
  CUSTOMER: "CUSTOMER",
  PARTNER: "PARTNER",
} as const;

export const CUSTOMER_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export const CUSTOMER_SEGMENT = {
  VIP: "VIP",
  GOLD: "GOLD",
  SILVER: "SILVER",
  BRONZE: "BRONZE",
  STANDARD: "STANDARD",
} as const;

export const CUSTOMER_CREDIT_CHECK_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  IN_PROGRESS: "IN_PROGRESS",
} as const;

export const CUSTOMER_SIZE = {
  MEDIUM: "MEDIUM",
  MICRO: "MICRO",
  SMALL: "SMALL",
  LARGE: "LARGE",
  ENTERPRISE: "ENTERPRISE",
} as const;
