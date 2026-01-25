import { z } from "zod";
import {
  OpportunitySortFieldSchema,
  OpportunityStatusSchema,
  SalesStageSchema,
} from "../validators";

export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;
export type SalesStage = z.infer<typeof SalesStageSchema>;
export type OpportunitySortField = z.infer<typeof OpportunitySortFieldSchema>;
