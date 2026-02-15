import { z } from "zod";
import {
  opportunitySourceSchema,
  opportunityStatusSchema,
  salesStageSchema,
} from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type OpportunityStatus = z.infer<typeof opportunityStatusSchema>;
export type SalesStage = z.infer<typeof salesStageSchema>;
export type OpportunitySource = z.infer<typeof opportunitySourceSchema>;
