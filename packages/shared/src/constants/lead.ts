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
