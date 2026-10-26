import { z } from "zod";
import {
  DOCUMENT_LINE_TYPES,
  DOCUMENT_PARTY_ROLES,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
} from "../../constants";
import {
  documentDirectionSchema,
  documentRelationTypeSchema,
  documentStatusCategorySchema,
  installmentStatusSchema,
  matchStatusSchema,
} from "../../validators/document";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type DocumentType = keyof typeof DOCUMENT_TYPES;
export type DocumentStatus = keyof typeof DOCUMENT_STATUSES;
export type DocumentDirection = z.infer<typeof documentDirectionSchema>;
export type MatchStatus = z.infer<typeof matchStatusSchema>;
export type DocumentPartyRole = (typeof DOCUMENT_PARTY_ROLES)[keyof typeof DOCUMENT_PARTY_ROLES];
export type DocumentStatusCategory = z.infer<typeof documentStatusCategorySchema>;
export type DocumentRelationType = z.infer<typeof documentRelationTypeSchema>;
export type DocumentLineType = (typeof DOCUMENT_LINE_TYPES)[keyof typeof DOCUMENT_LINE_TYPES];
export type InstallmentStatus = z.infer<typeof installmentStatusSchema>;
