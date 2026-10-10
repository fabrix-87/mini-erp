import { z } from "zod";

import {
  leadStatusSchema,
  leadSourceSchema,
  leadQualitySchema,
  purchaseTimeframeSchema,
  decisionAuthoritySchema,
  leadSortBySchema,
} from "../validators/lead";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type LeadSource = z.infer<typeof leadSourceSchema>;
export type LeadQuality = z.infer<typeof leadQualitySchema>;
export type PurchaseTimeframe = z.infer<typeof purchaseTimeframeSchema>;
export type DecisionAuthority = z.infer<typeof decisionAuthoritySchema>;
export type LeadSortableFields = z.infer<typeof leadSortBySchema>;

export const LEAD_STATUS = {
    NEW: "NEW",
    CONTACTED: "CONTACTED",
    QUALIFIED: "QUALIFIED",
    UNQUALIFIED: "UNQUALIFIED",
    NURTURING: "NURTURING",
    CONVERTED: "CONVERTED",
    LOST: "LOST",
    DUPLICATE: "DUPLICATE",
    ARCHIVED: "ARCHIVED",
} as const;

export const LEAD_SOURCE = {
    WEBSITE: "WEBSITE",
    REFERRAL: "REFERRAL",
    SOCIAL_MEDIA: "SOCIAL_MEDIA",
    EMAIL_CAMPAIGN: "EMAIL_CAMPAIGN",
    PHONE_CALL: "PHONE_CALL",
    COLD_CALL: "COLD_CALL",
    EVENT: "EVENT",
    PARTNER: "PARTNER",
    ADVERTISING: "ADVERTISING",
    CONTENT: "CONTENT",
    DIRECT: "DIRECT",
    CHAT: "CHAT",
    OTHER: "OTHER",
} as const

export const LEAD_SORT_OPTIONS = [
  "code",
  "companyName",
  "status",
  "quality",
  "score",
  "estimatedValue",
  "createdAt",
  "lastContactDate",
] as const

export const LEAD_QUALITY = {
    HOT: "HOT",
    WARM: "WARM",
    COLD: "COLD",
} as const;

export const LEAD_PURCHASE_TIMEFRAME = {
    IMMEDIATE: "IMMEDIATE",
    SHORT_TERM: "SHORT_TERM",
    MEDIUM_TERM: "MEDIUM_TERM",
    LONG_TERM: "LONG_TERM",
    UNDEFINED: "UNDEFINED",
} as const;

export const LEAD_DECISION_AUTHORITY = {
    DECISION_MAKER: "DECISION_MAKER",
    INFLUENCER: "INFLUENCER",
    GATEKEEPER: "GATEKEEPER",
    END_USER: "END_USER",
    UNKNOWN: "UNKNOWN",
} as const;