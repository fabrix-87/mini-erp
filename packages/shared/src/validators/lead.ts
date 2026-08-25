import { z } from "zod";
import { createCuidSchema, createIdSchema } from "./primitives/id";
import { emailSchema, emptyStringToNull, phoneSchema, urlSchema } from "./primitives/string";
import { isoDateSchema } from "./primitives/date";
import { createDecimalSchema } from "./primitives/decimal";
import { countryCodeBaseSchema, inputJsonValueSchema, leadIdBaseSchema, userIdSchema } from "./base";
import { sortOrderSchema, pageSchema, limitSchema } from "./query/pagination";
import { queryBooleanSchema, queryNumberSchema } from "./query/params";
import {
  customerPrioritySchema,
  customerSegmentSchema,
  customerSizeSchema,
  customerTypeSchema,
} from "./customer";
import { companyTypeEntitySchema } from "./company";

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Lead Status enum
 */
export const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "NURTURING",
  "CONVERTED",
  "LOST",
  "DUPLICATE",
  "ARCHIVED",
]);

/**
 * Lead Source enum
 */
export const leadSourceSchema = z.enum([
  "WEBSITE",
  "REFERRAL",
  "SOCIAL_MEDIA",
  "EMAIL_CAMPAIGN",
  "PHONE_CALL",
  "COLD_CALL",
  "EVENT",
  "PARTNER",
  "ADVERTISING",
  "CONTENT",
  "DIRECT",
  "CHAT",
  "OTHER",
]);

/**
 * Lead Sort By enum
 */
export const leadSortBySchema = z.enum([
  "code",
  "companyName",
  "status",
  "quality",
  "score",
  "estimatedValue",
  "createdAt",
  "lastContactDate",
]);

/**
 * Lead Quality enum
 */
export const leadQualitySchema = z.enum(["HOT", "WARM", "COLD"]);

/**
 * Purchase Timeframe enum
 */
export const purchaseTimeframeSchema = z.enum([
  "IMMEDIATE",
  "SHORT_TERM",
  "MEDIUM_TERM",
  "LONG_TERM",
  "UNDEFINED",
]);

/**
 * Decision Authority enum
 */
export const decisionAuthoritySchema = z.enum([
  "DECISION_MAKER",
  "INFLUENCER",
  "GATEKEEPER",
  "END_USER",
  "UNKNOWN",
]);

// ============================================================================
// DECIMAL HELPERS
// ============================================================================

/**
 * Schema for estimated value (15, 2)
 */
const estimatedValueSchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: 0,
});

/**
 * Schema for lead score (0-100)
 */
const leadScoreSchema = z
  .number()
  .int("Score deve essere un intero")
  .min(0, "Score minimo è 0")
  .max(100, "Score massimo è 100")
  .default(0);

// ============================================================================
// LEAD SCHEMAS
// ============================================================================

export const assignedUserIdSchema = z.object({
  assignedUserId: userIdSchema,
});

/**
 * Raw object shape for Lead — no refinements.
 * Used as base for both create and update schemas.
 */
export const leadShape = z.object({
  code: z.string().max(20, "Codice non può superare 20 caratteri").trim().optional(),

  // Company data
  companyName: z
    .string()
    .min(1, "Nome azienda obbligatorio")
    .max(255, "Nome azienda max 255 caratteri")
    .trim(),

  tradeName: z.string().max(255).optional().nullable(),
  website: urlSchema(false, 255),
  vatNumber: z.string().max(20).optional().nullable(),
  taxCode: z.string().max(20).optional().nullable(),
  countryCode: countryCodeBaseSchema.default("IT").optional().nullable(),

  // Contact data
  contactFirstName: z
    .string()
    .min(1, "Nome contatto obbligatorio")
    .max(100, "Nome contatto max 100 caratteri")
    .trim(),

  contactLastName: z
    .string()
    .min(1, "Cognome contatto obbligatorio")
    .max(100, "Cognome contatto max 100 caratteri")
    .trim(),

  contactEmail: emailSchema(),
  contactPhone: phoneSchema,
  contactMobile: phoneSchema,
  contactPosition: z.string().max(100).optional().nullable(),
  contactDepartment: z.string().max(100).optional().nullable(),

  // Address
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  provinceCode: emptyStringToNull(z.string().length(2, "Codice provincia non valido"))
    .optional()
    .nullable(),
  zipCode: z.string().max(20).optional().nullable(),

  // Lead management
  status: leadStatusSchema.default("NEW"),
  source: leadSourceSchema.default("OTHER"),
  quality: leadQualitySchema.default("COLD"),
  score: leadScoreSchema,

  // Commercial data
  estimatedValue: estimatedValueSchema.optional().nullable(),
  estimatedSize: customerSizeSchema.optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  employeesCount: z.number().int().positive().optional().nullable(),
  annualRevenue: estimatedValueSchema.optional().nullable(),
  budget: estimatedValueSchema.optional().nullable(),
  purchaseTimeframe: z.string().max(50).optional().nullable(),
  decisionAuthority: z.string().max(50).optional().nullable(),
  primaryNeed: z.string().max(5000).optional().nullable(),
  interestedIn: z.string().max(5000).optional().nullable(),

  // Assignment
  assignedUserId: userIdSchema.optional().nullable(),

  // BANT
  bantQualified: z.boolean().default(false),
  bantNotes: z.string().max(5000).optional().nullable(),

  // GDPR
  privacyConsent: z.boolean().default(false),
  privacyConsentDate: isoDateSchema(),
  marketingConsent: z.boolean().default(false),
  marketingConsentDate: isoDateSchema(),
  doNotCall: z.boolean().default(false),
  doNotEmail: z.boolean().default(false),

  // Campaign tracking
  campaignName: z.string().max(100).optional().nullable(),
  utmMedium: z.string().max(50).optional().nullable(),
  utmSource: z.string().max(50).optional().nullable(),
  utmCampaign: z.string().max(50).optional().nullable(),
  landingPage: z.string().max(255).optional().nullable(),
  referrer: z.string().max(255).optional().nullable(),

  // Notes
  notes: z.string().max(5000).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  competitors: z.string().max(5000).optional().nullable(),

  // Custom fields
  customFields: inputJsonValueSchema.optional().nullable(),
});

/**
 * Schema for creating a Lead — includes GDPR consent date validation.
 * Uses superRefine to preserve inferred output type across refinements.
 */
export const createLeadSchema = leadShape.strict().superRefine((data, ctx) => {
  if (data.privacyConsent && !data.privacyConsentDate) {
    ctx.addIssue({
      code: "custom",
      message: "Data consenso privacy obbligatoria se consenso accordato",
      path: ["privacyConsentDate"],
    });
  }

  if (data.marketingConsent && !data.marketingConsentDate) {
    ctx.addIssue({
      code: "custom",
      message: "Data consenso marketing obbligatoria se consenso accordato",
      path: ["marketingConsentDate"],
    });
  }
});

/**
 * Schema for updating a Lead — partial, code is immutable after creation.
 * GDPR consent refinements omitted: partial updates may carry only one
 * of the two fields; controller validates consistency against DB state.
 */
export const updateLeadSchema = leadShape.omit({ code: true }).partial().strict();

const updateLeadStatusShape = z.object({
  status: leadStatusSchema,
  lostReason: z.string().max(1000).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Schema for updating Lead status — lostReason required when LOST.
 */
export const updateLeadStatusSchema = updateLeadStatusShape.strict().refine(
  (data) => {
    if (data.status === "LOST" && !data.lostReason) return false;
    return true;
  },
  {
    message: "Motivo perdita obbligatorio quando status è LOST",
    path: ["lostReason"],
  },
);

/**
 * Schema for updating Lead score
 */
export const updateLeadScoreSchema = z
  .object({
    score: leadScoreSchema,
    notes: z.string().max(1000).optional().nullable(),
  })
  .strict();

const baseFields = {
  budget: estimatedValueSchema.nullable().optional(),
  decisionAuthority: decisionAuthoritySchema.nullable().optional(),
  primaryNeed: z.string().max(5000),
  purchaseTimeframe: purchaseTimeframeSchema.nullable().optional(),
  bantNotes: z.string().max(5000).optional().nullable(),
};

const qualifiedSchema = z.object({
  bantQualified: z.literal(true),
  budget: estimatedValueSchema,
  decisionAuthority: decisionAuthoritySchema,
  primaryNeed: z.string().max(5000),
  purchaseTimeframe: purchaseTimeframeSchema,
  bantNotes: z.string().max(5000).optional().nullable(),
});

const unqualifiedSchema = z.object({
  bantQualified: z.literal(false),
  ...baseFields,
});

/**
 * Schema for BANT Lead qualification — all BANT fields required when qualified.
 */
export const qualifyLeadSchema = z.discriminatedUnion("bantQualified", [
  unqualifiedSchema,
  qualifiedSchema,
]);

const convertLeadShape = z.object({
  companyName: z.string().min(1).max(255),
  vatNumber: z.string().min(1).max(20).optional(),
  taxCode: z.string().min(1).max(20).optional(),
  entityType: companyTypeEntitySchema,
  countryCode: countryCodeBaseSchema,
  customerType: customerTypeSchema.default("CUSTOMER"),
  priority: customerPrioritySchema.default("LOW"),
  segment: customerSegmentSchema.default("STANDARD"),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Schema for converting a Lead to Customer — Italian companies require
 * vatNumber or taxCode.
 */
export const convertLeadSchema = convertLeadShape.strict().refine(
  (data) => {
    if (data.countryCode === "IT") {
      return !!(data.vatNumber || data.taxCode);
    }
    return true;
  },
  {
    message: "P.IVA o Codice Fiscale obbligatorio per aziende italiane",
    path: ["vatNumber"],
  },
);

/**
 * Schema for bulk Lead assignment
 */
export const bulkAssignLeadsSchema = z
  .object({
    leadIds: z.array(leadIdBaseSchema).min(1, "Seleziona almeno una lead"),
    assignedUserId: userIdSchema,
  })
  .strict();

/**
 * Schema for bulk Lead status update
 */
export const bulkUpdateLeadStatusSchema = z
  .object({
    leadIds: z.array(leadIdBaseSchema).min(1, "Seleziona almeno una lead"),
    status: leadStatusSchema,
    lostReason: z.string().max(1000).optional().nullable(),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema for Lead queries
 */
export const leadQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  status: leadStatusSchema.optional(),
  source: leadSourceSchema.optional(),
  quality: leadQualitySchema.optional(),
  assignedUserId: userIdSchema.optional(),
  countryCode: countryCodeBaseSchema.optional(),
  minScore: queryNumberSchema("Score non valido")
    .pipe(z.number().int().min(0).max(100).optional())
    .optional(),
  maxScore: queryNumberSchema("Score non valido")
    .pipe(z.number().int().min(0).max(100).optional())
    .optional(),
  estimatedSize: customerSizeSchema.optional(),
  industry: z.string().optional(),
  bantQualified: queryBooleanSchema.optional(),
  privacyConsent: queryBooleanSchema.optional(),
  marketingConsent: queryBooleanSchema.optional(),
  hasPendingActivity: queryBooleanSchema.optional(), // ha activity SCHEDULED future
  campaignName: z.string().optional(),
  createdFrom: isoDateSchema().optional(),
  createdTo: isoDateSchema().optional(),
  lastContactFrom: isoDateSchema().optional(),
  lastContactTo: isoDateSchema().optional(),
  sortBy: leadSortBySchema.default("createdAt"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const leadIdParamSchema = z.object({
  id: leadIdBaseSchema,
});

/**
 * Schema for Lead statistics filters
 */
export const leadStatsSchema = z.object({
  assignedUserId: userIdSchema.optional(),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  source: leadSourceSchema.optional(),
  campaignName: z.string().optional(),
});
