// ============================================================================
// LEAD TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Country } from "./country";
import type { User } from "./user";
import type { Customer } from "./customer";
import type { Activity } from "./activity";
import type { Document } from "./document";
import type { Opportunity } from "./opportunity";
import Decimal from "decimal.js";
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  updateLeadScoreSchema,
  qualifyLeadSchema,
  convertLeadSchema,
  bulkAssignLeadsSchema,
  bulkUpdateLeadStatusSchema,
  leadQuerySchema,
  leadIdParamSchema,
  leadStatsSchema,
} from "../validators/lead";
import { DecisionAuthority, LeadQuality, LeadSource, LeadStatus, PurchaseTimeframe } from "../constants/lead";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Lead entity
 */
export type Lead = Omit<CreateLeadInput, "code"> & {
  id: number;
  code: string;
  country: Country;
  assignedUser?: User | null;
  convertedTo?: Customer | null;
  convertedBy?: User | null;
  activities: Activity[];
  documents: Document[];
  opportunities: Opportunity[];
  // Additional tracking fields
  convertedAt: Date | null;
  convertedByUserId: number | null;
  lostDate: Date | null;
  firstContactDate: Date | null;
  lastContactDate: Date | null;
  contactAttempts: number;
  lastStatusChange: Date;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type UpdateLeadScoreInput = z.infer<typeof updateLeadScoreSchema>;
export type QualifyLeadInput = z.infer<typeof qualifyLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
export type BulkAssignLeadsInput = z.infer<typeof bulkAssignLeadsSchema>;
export type BulkUpdateLeadStatusInput = z.infer<
  typeof bulkUpdateLeadStatusSchema
>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
export type LeadStatsInput = z.infer<typeof leadStatsSchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type LeadIdParam = z.infer<typeof leadIdParamSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Simplified lead for list views
 */
export type LeadListItem = {
  id: number;
  code: string;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string | null;
  status: LeadStatus;
  source: LeadSource;
  quality: LeadQuality;
  score: number;
  estimatedValue: Decimal | null;
  assignedUserId: number | null;
  assignedUserName: string | null;
  nextFollowUpDate: Date | null;
  lastContactDate: Date | null;
  createdAt: Date;
};

/**
 * Lead with full contact details
 */
export type LeadWithContact = Lead & {
  fullContactName: string;
  primaryContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    mobile: string | null;
    position: string | null;
    department: string | null;
  };
};

/**
 * Lead statistics
 */
export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  bySource: Record<LeadSource, number>;
  byQuality: Record<LeadQuality, number>;
  newThisMonth: number;
  newThisWeek: number;
  converted: number;
  conversionRate: number; // percentage
  lost: number;
  averageScore: number;
  averageConversionTime: number; // days
  totalEstimatedValue: Decimal;
  qualifiedLeads: number;
  needFollowUp: number;
  overduFollowUp: number;
}

/**
 * Lead funnel metrics
 */
export interface LeadFunnelMetrics {
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  conversionRateNewToContacted: number;
  conversionRateContactedToQualified: number;
  conversionRateQualifiedToConverted: number;
  averageTimeInStage: Record<LeadStatus, number>; // days
}

/**
 * Lead scoring criteria
 */
export interface LeadScoringCriteria {
  demographicScore: number; // 0-40 points
  behavioralScore: number; // 0-30 points
  engagementScore: number; // 0-30 points
  totalScore: number; // 0-100
  recommendations: string[];
}

/**
 * Lead scoring breakdown
 */
export interface LeadScoringBreakdown {
  leadId: number;
  // Demographic (max 40 points)
  companySize: number; // 0-10
  industry: number; // 0-10
  budget: number; // 0-10
  location: number; // 0-10
  // Behavioral (max 30 points)
  websiteVisits: number; // 0-10
  contentDownloads: number; // 0-10
  emailOpens: number; // 0-10
  // Engagement (max 30 points)
  responses: number; // 0-10
  meetings: number; // 0-10
  referrals: number; // 0-10
  totalScore: number;
  lastCalculated: Date;
}

/**
 * Lead conversion readiness
 */
export interface LeadConversionReadiness {
  leadId: number;
  isReady: boolean;
  score: number;
  missingFields: string[];
  missingDocuments: string[];
  recommendations: string[];
  estimatedConversionProbability: number; // 0-100 percentage
}

/**
 * Lead activity summary
 */
export interface LeadActivitySummary {
  leadId: number;
  totalActivities: number;
  lastActivityDate: Date | null;
  nextScheduledActivity: Date | null;
  activitiesByType: Record<string, number>;
  daysSinceLastContact: number;
  contactAttempts: number;
  responseRate: number; // percentage
}

/**
 * Lead campaign performance
 */
export interface LeadCampaignPerformance {
  campaignName: string;
  source: LeadSource;
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  qualificationRate: number; // percentage
  conversionRate: number; // percentage
  averageScore: number;
  totalEstimatedValue: Decimal;
  averageEstimatedValue: Decimal;
  costPerLead: Decimal | null;
  costPerConversion: Decimal | null;
  roi: number | null; // percentage
}

/**
 * Lead assignment suggestion
 */
export interface LeadAssignmentSuggestion {
  leadId: number;
  suggestedUserId: number;
  suggestedUserName: string;
  reason: string;
  confidence: number; // 0-100 percentage
  factors: {
    workload: number;
    expertise: number;
    availability: number;
    performance: number;
  };
}

/**
 * BANT qualification result
 */
export interface BANTQualification {
  leadId: number;
  budget: {
    isQualified: boolean;
    value: Decimal | null;
    notes: string | null;
  };
  authority: {
    isQualified: boolean;
    level: DecisionAuthority | null;
    notes: string | null;
  };
  need: {
    isQualified: boolean;
    description: string | null;
    priority: "high" | "medium" | "low" | null;
  };
  timeframe: {
    isQualified: boolean;
    value: PurchaseTimeframe | null;
    notes: string | null;
  };
  overallQualified: boolean;
  qualificationDate: Date | null;
  qualifiedBy: number | null;
}
