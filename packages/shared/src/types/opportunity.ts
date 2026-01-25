// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import {
  AssignUserSchema,
  CloseOpportunityLostSchema,
  CloseOpportunityWonSchema,
  CreateOpportunitySchema,
  CustomerIdParamSchema,
  OpportunityIdSchema,
  OpportunityQueryByStatusSchema,
  OpportunityQuerySchema,
  UpdateOpportunitySchema,
  UpdateStageSchema,
} from "../validators/opportunity";
import { Customer } from "./customer";
import { User } from "./user";
import { Document } from "./document";
import { Activity } from "./activity";

// Input type
export type CreateOpportunityInput = z.infer<typeof CreateOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof UpdateOpportunitySchema>;
export type UpdateStageInput = z.infer<typeof UpdateStageSchema>;
export type CloseOpportunityWonInput = z.infer<
  typeof CloseOpportunityWonSchema
>;
export type CloseOpportunityLostInput = z.infer<
  typeof CloseOpportunityLostSchema
>;
// Query type
export type OpportunityQueryInput = z.infer<typeof OpportunityQuerySchema>;
export type OpportunityQueryByStatusInput = z.infer<
  typeof OpportunityQueryByStatusSchema
>;
// Action type
export type AssignUserInput = z.infer<typeof AssignUserSchema>;
// Param types
export type CustomerIdParam = z.infer<typeof CustomerIdParamSchema>;
export type OpportunityIdParam = z.infer<typeof OpportunityIdSchema>;

// entity type
export type Opportunity = CreateOpportunityInput & {
    id: number;
    customer: Customer;
    weightedValue: number;
    closedDate: Date;
    closedReasonId: number;
    closedNotes: string;
    createdByUserId: number;
    createdBy: User;
    assignedUser: User;
    lastStageChange: Date;
    documents: Document[];
    activities: Activity[];

    createdAt: Date;
    updatedAt: Date;
};

export type ClosedReason = {
    id: number;
    code: string;
    description: string;
}

export interface OpportunityDashboardStats {
  total: number;
  totalEstimatedValue: number;
  totalWeightedValue: number;
  wonThisMonth: number;
  wonValueThisMonth: number;
  byStage: {
    prospecting: number;
    qualification: number;
    proposal: number;
    negotiation: number;
    closed_won: number;
    closed_lost: number;
  };
}
