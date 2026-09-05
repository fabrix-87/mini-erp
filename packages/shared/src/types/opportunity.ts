// ============================================================================
// OPPORTUNITY TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Lead } from "./lead";
import type { Customer } from "./customer";
import type { User } from "./user";
import type { Document } from "./document";
import type { Activity } from "./activity";
import Decimal from "decimal.js";
import {
  proposedProductSchema,
  createOpportunitySchema,
  updateOpportunitySchema,
  updateOpportunityStageSchema,
  updateOpportunityStatusSchema,
  winOpportunitySchema,
  loseOpportunitySchema,
  bulkAssignOpportunitiesSchema,
  bulkUpdateStageSchema,
  createClosedReasonSchema,
  updateClosedReasonSchema,
  opportunityQuerySchema,
  closedReasonQuerySchema,
  opportunityIdParamSchema,
  closedReasonIdParamSchema,
  opportunityStatsSchema,
  salesFunnelAnalysisSchema,
  customerIdParamSchema,
  opportunityShape,
} from "../validators/opportunity";
import { OpportunitySource, OpportunityStatus, SalesStage } from "../constants";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Proposed product in opportunity
 */
export type ProposedProduct = z.infer<typeof proposedProductSchema>;

/**
 * Opportunity entity
 */
export type Opportunity = Omit<CreateOpportunityInput, "proposedProducts"> & {
  id: string;
  lead?: Lead | null;
  customer: Customer;
  source: OpportunitySource;
  createdBy: User;
  assignedUser?: User | null;
  closedReason?: ClosedReason | null;
  documents: Document[];
  activities: Activity[];
  // Additional tracking fields
  weightedValue: Decimal;
  actualValue: Decimal | null;
  closedDate: Date | null;
  closedNotes: string | null;
  lastStageChange: Date;
  daysInCurrentStage: number;
  totalActivities: number;
  lastActivityDate: Date | null;
  proposedProducts: ProposedProduct[] | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Closed Reason entity
 */
export type ClosedReason = {
  id: string;
  code: string;
  description: string;
  isWon: boolean;
  active: boolean;
  displayOrder: number;
  opportunities: Opportunity[];
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type CreateOpportunityFormValues = z.input<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type UpdateOpportunityFormValues = z.input<typeof updateOpportunitySchema>;

export type UpdateOpportunityStageInput = z.infer<
typeof updateOpportunityStageSchema
>;
export type UpdateOpportunityStatusInput = z.infer<
  typeof updateOpportunityStatusSchema
>;
export type WinOpportunityInput = z.infer<typeof winOpportunitySchema>;
export type LoseOpportunityInput = z.infer<typeof loseOpportunitySchema>;
export type BulkAssignOpportunitiesInput = z.infer<
  typeof bulkAssignOpportunitiesSchema
>;
export type BulkUpdateStageInput = z.infer<typeof bulkUpdateStageSchema>;

export type CreateClosedReasonInput = z.infer<typeof createClosedReasonSchema>;
export type UpdateClosedReasonInput = z.infer<typeof updateClosedReasonSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type OpportunityQueryInput = z.infer<typeof opportunityQuerySchema>;
export type ClosedReasonQueryInput = z.infer<typeof closedReasonQuerySchema>;
export type OpportunityStatsInput = z.infer<typeof opportunityStatsSchema>;
export type SalesFunnelAnalysisInput = z.infer<
  typeof salesFunnelAnalysisSchema
>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type OpportunityIdParam = z.infer<typeof opportunityIdParamSchema>;
export type ClosedReasonIdParam = z.infer<typeof closedReasonIdParamSchema>;
export type OpportunityCustomerIdParam = z.infer<typeof customerIdParamSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Simplified opportunity for list views
 */
export type OpportunityListItem = {
  id: string;
  title: string;
  customerName: string;
  status: OpportunityStatus;
  stage: SalesStage;
  source: OpportunitySource;
  estimatedValue: Decimal | null;
  weightedValue: Decimal;
  probability: number;
  expectedCloseDate: Date | null;
  assignedUserId: string | null;
  assignedUserName: string | null;
  daysInCurrentStage: number;
  lastActivityDate: Date | null;
  createdAt: Date;
};

/**
 * Opportunity with all relations loaded
 */
export type OpportunityComplete = Opportunity & {
  lead: Lead | null;
  customer: Customer;
  createdBy: User;
  assignedUser: User | null;
  closedReason: ClosedReason | null;
  activities: Activity[];
  documents: Document[];
};

/**
 * Opportunity statistics
 */
export interface OpportunityStats {
  total: number;
  open: number;
  won: number;
  lost: number;
  pending: number;
  byStatus: Record<OpportunityStatus, number>;
  byStage: Record<SalesStage, number>;
  bySource: Record<OpportunitySource, number>;
  totalEstimatedValue: Decimal;
  totalWeightedValue: Decimal;
  totalWonValue: Decimal;
  averageWinValue: Decimal;
  winRate: number; // percentage
  averageDealSize: Decimal;
  averageSalesCycle: number; // days
  totalProposedProducts: number;
  conversionRate: number; // percentage
}

/**
 * Sales funnel metrics
 */
export interface SalesFunnelMetrics {
  stages: {
    stage: SalesStage;
    count: number;
    totalValue: Decimal;
    weightedValue: Decimal;
    conversionRate: number; // to next stage
    averageTimeInStage: number; // days
    stagnantCount: number; // opportunities stuck in this stage
  }[];
  totalOpportunities: number;
  totalValue: Decimal;
  overallConversionRate: number;
  averageSalesCycle: number;
  bottleneckStage: SalesStage | null;
}

/**
 * Opportunity pipeline analysis
 */
export interface OpportunityPipelineAnalysis {
  totalPipelineValue: Decimal;
  weightedPipelineValue: Decimal;
  opportunitiesByStage: Record<SalesStage, number>;
  valueByStage: Record<SalesStage, Decimal>;
  expectedClosingsThisMonth: number;
  expectedClosingsThisQuarter: number;
  expectedValueThisMonth: Decimal;
  expectedValueThisQuarter: Decimal;
  averageDealSize: Decimal;
  medianDealSize: Decimal;
  largestDeal: Decimal;
  smallestDeal: Decimal;
}

/**
 * Win/Loss analysis
 */
export interface WinLossAnalysis {
  totalClosed: number;
  won: number;
  lost: number;
  winRate: number; // percentage
  totalWonValue: Decimal;
  averageWonValue: Decimal;
  winReasons: {
    reasonId: number;
    reasonCode: string;
    reasonDescription: string;
    count: number;
    percentage: number;
    totalValue: Decimal;
  }[];
  lossReasons: {
    reasonId: number;
    reasonCode: string;
    reasonDescription: string;
    count: number;
    percentage: number;
    lostValue: Decimal;
  }[];
  commonWinFactors: string[];
  commonLossFactors: string[];
}

/**
 * Opportunity health score
 */
export interface OpportunityHealthScore {
  opportunityId: number;
  score: number; // 0-100
  factors: {
    ageScore: number; // based on time in current stage
    activityScore: number; // based on recent activities
    valueScore: number; // based on deal size
    probabilityScore: number; // based on current probability
    progressScore: number; // based on stage progression
  };
  risk: "low" | "medium" | "high";
  recommendations: string[];
  nextBestActions: string[];
}

/**
 * Sales velocity metrics
 */
export interface SalesVelocityMetrics {
  period: "day" | "week" | "month" | "quarter" | "year";
  numberOfDeals: number;
  averageDealValue: Decimal;
  averageWinRate: number; // percentage
  averageSalesCycle: number; // days
  velocity: Decimal; // (deals * avg value * win rate) / sales cycle
  trend: "increasing" | "stable" | "decreasing";
  previousVelocity: Decimal;
  percentageChange: number;
}

/**
 * Opportunity forecast
 */
export interface OpportunityForecast {
  period: string; // e.g., "Q1 2026", "March 2026"
  bestCase: Decimal; // Sum of all opportunities with probability > 75%
  mostLikely: Decimal; // Weighted sum of all opportunities
  worstCase: Decimal; // Sum of only committed opportunities (probability > 90%)
  opportunitiesCount: number;
  averageProbability: number;
  confidence: number; // 0-100, based on historical accuracy
}

/**
 * Sales rep performance on opportunities
 */
export interface SalesRepOpportunityPerformance {
  userId: number;
  userName: string;
  totalOpportunities: number;
  openOpportunities: number;
  wonOpportunities: number;
  lostOpportunities: number;
  winRate: number; // percentage
  totalWonValue: Decimal;
  averageWonValue: Decimal;
  pipelineValue: Decimal;
  weightedPipelineValue: Decimal;
  averageSalesCycle: number; // days
  activitiesPerOpportunity: number;
  quota: Decimal | null;
  quotaAttainment: number | null; // percentage
}

/**
 * Stage probability mapping
 */
export interface StageProbabilityMapping {
  stage: SalesStage;
  defaultProbability: number;
  minProbability: number;
  maxProbability: number;
  averageTimeInStage: number; // days
  conversionRate: number; // percentage to next stage
}

/**
 * Opportunity next actions
 */
export interface OpportunityNextActions {
  opportunityId: number;
  suggestions: {
    priority: "high" | "medium" | "low";
    action: string;
    reason: string;
    dueDate: Date | null;
  }[];
  overdue: boolean;
  daysSinceLastActivity: number;
  riskOfLoss: number; // 0-100 percentage
}

/**
 * Competitive analysis
 */
export interface CompetitiveAnalysis {
  competitor: string;
  opportunitiesWon: number;
  opportunitiesLost: number;
  winRate: number; // percentage against this competitor
  averageWonValue: Decimal;
  averageLostValue: Decimal;
  commonWinReasons: string[];
  commonLossReasons: string[];
  marketShare: number; // percentage
}
