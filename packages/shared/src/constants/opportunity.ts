import { z } from "zod";
import { opportunitySourceSchema, opportunityStatusSchema, salesStageSchema } from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================
export const OPPORTUNITY_STATUS = {
  OPEN: "OPEN",
  WON: "WON",
  LOST: "LOST",
  PENDING: "PENDING",
  CLOSED: "CLOSED",
} as const;

export const OPPORTUNITY_SALES_STAGE = {
  LEAD_QUALIFICATION: "LEAD_QUALIFICATION",
  PROSPECTING: "PROSPECTING",
  NEEDS_ANALYSIS: "NEEDS_ANALYSIS",
  PROPOSAL_SENT: "PROPOSAL_SENT",
  NEGOTIATION: "NEGOTIATION",
  COMMITMENT: "COMMITMENT",
} as const;

export const OPPORTUNITY_SOURCE = {
  LEAD: "LEAD",
  CUSTOMER: "CUSTOMER",
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND",
  REFERRAL: "REFERRAL",
  PARTNER: "PARTNER",
  EVENT: "EVENT",
  OTHER: "OTHER",
} as const;

export const OPPORTUNITY_SORT_FIELDS = [
  "title",
  "estimatedValue",
  "weightedValue",
  "probability",
  "expectedCloseDate",
  "createdAt",
  "lastStageChange",
] as const;

export type OpportunityStatus = z.infer<typeof opportunityStatusSchema>;
export type SalesStage = z.infer<typeof salesStageSchema>;
export type OpportunitySource = z.infer<typeof opportunitySourceSchema>;
