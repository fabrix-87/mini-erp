import { z } from "zod";
import { opportunitySourceSchema, opportunityStatusSchema, salesStageSchema } from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type OpportunityStatus = z.infer<typeof opportunityStatusSchema>;
export const OpportunityStatus = opportunityStatusSchema.enum;
export type SalesStage = z.infer<typeof salesStageSchema>;
export const SalesStage = salesStageSchema.enum;
export type OpportunitySource = z.infer<typeof opportunitySourceSchema>;
export const OpportunitySource = opportunitySourceSchema.enum;
