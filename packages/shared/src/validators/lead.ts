import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { emailSchema, phoneSchema } from "./primitives/string";
import { isoDateSchema } from "./primitives/date";
import { createDecimalSchema } from "./primitives/decimal";
import { countryCodeBaseSchema, inputJsonValueSchema } from "./base";
import { sortOrderSchema, pageSchema, limitSchema } from "./query/pagination";
import { queryBooleanSchema, queryNumberSchema } from "./query/params";
import { customerPrioritySchema, customerSegmentSchema, customerSizeSchema, customerTypeSchema } from "./customer";
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
 * Lead Quality enum
 */
export const leadQualitySchema = z.enum(["HOT", "WARM", "COLD"]);

/**
 * Purchase Timeframe enum
 */
export const purchaseTimeframeSchema = z.enum([
  "IMMEDIATE",
  "1_3_MONTHS",
  "3_6_MONTHS",
  "6_12_MONTHS",
  "12_PLUS_MONTHS",
]);

/**
 * Decision Authority enum
 */
export const decisionAuthoritySchema = z.enum([
  "DECISION_MAKER",
  "INFLUENCER",
  "GATEKEEPER",
  "USER",
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

/**
 * Schema for Lead ID
 */
export const leadIdSchema = createIdSchema("ID Lead non valido");

/**
 * Schema for creating a Lead
 */
export const createLeadSchema = z
  .object({
    code: z
      .string()
      .max(20, "Codice non può superare 20 caratteri")
      .trim()
      .optional(), // Auto-generated if not provided

    // Company data
    companyName: z
      .string()
      .min(1, "Nome azienda obbligatorio")
      .max(255, "Nome azienda max 255 caratteri")
      .trim(),

    tradeName: z
      .string()
      .max(255, "Trade name max 255 caratteri")
      .optional()
      .nullable(),

    website: z.string().url("URL non valido").max(255).optional().nullable(),

    vatNumber: z.string().max(20).optional().nullable(),

    taxCode: z.string().max(20).optional().nullable(),

    countryCode: countryCodeBaseSchema.default("IT"),

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

    // Address (simplified)
    address: z.string().max(255).optional().nullable(),

    city: z.string().max(100).optional().nullable(),

    provinceCode: z.string().length(2).optional().nullable(),

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
    assignedUserId: createIdSchema("User ID non valido").optional().nullable(),

    // Follow-up
    nextFollowUpDate: isoDateSchema(),

    // BANT Qualification
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
  })
  .strict()
  .refine(
    (data) => {
      // If privacyConsent is true, privacyConsentDate must be set
      if (data.privacyConsent && !data.privacyConsentDate) {
        return false;
      }
      return true;
    },
    {
      message: "Data consenso privacy obbligatoria se consenso accordato",
      path: ["privacyConsentDate"],
    },
  )
  .refine(
    (data) => {
      // If marketingConsent is true, marketingConsentDate must be set
      if (data.marketingConsent && !data.marketingConsentDate) {
        return false;
      }
      return true;
    },
    {
      message: "Data consenso marketing obbligatoria se consenso accordato",
      path: ["marketingConsentDate"],
    },
  );

/**
 * Schema for updating a Lead
 */
export const updateLeadSchema = createLeadSchema
  .omit({ code: true })
  .partial()
  .strict();

/**
 * Schema for updating Lead status with reason
 */
export const updateLeadStatusSchema = z
  .object({
    status: leadStatusSchema,
    lostReason: z.string().max(1000).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  })
  .strict()
  .refine(
    (data) => {
      // If status is LOST, lostReason is required
      if (data.status === "LOST" && !data.lostReason) {
        return false;
      }
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

/**
 * Schema for Lead qualification (BANT)
 */
export const qualifyLeadSchema = z
  .object({
    bantQualified: z.boolean(),
    budget: estimatedValueSchema.optional().nullable(),
    decisionAuthority: decisionAuthoritySchema.optional().nullable(),
    primaryNeed: z.string().max(5000),
    purchaseTimeframe: purchaseTimeframeSchema.optional().nullable(),
    bantNotes: z.string().max(5000).optional().nullable(),
  })
  .strict()
  .refine(
    (data) => {
      // If bantQualified is true, all BANT fields should be set
      if (data.bantQualified) {
        return !!(
          data.budget &&
          data.decisionAuthority &&
          data.primaryNeed &&
          data.purchaseTimeframe
        );
      }
      return true;
    },
    {
      message:
        "Tutti i campi BANT (Budget, Authority, Need, Timeframe) sono obbligatori per lead qualificate",
      path: ["bantQualified"],
    },
  );

/**
 * Schema for converting Lead to Customer
 */
export const convertLeadSchema = z
  .object({
    // All required fields for customer creation
    companyName: z.string().min(1).max(255),
    vatNumber: z.string().min(1).max(20).optional(),
    taxCode: z.string().min(1).max(20).optional(),
    entityType: companyTypeEntitySchema,
    countryCode: countryCodeBaseSchema,
    // Customer specific fields
    customerType: customerTypeSchema.default("CUSTOMER"),
    priority: customerPrioritySchema.default("LOW"),
    segment: customerSegmentSchema.default("STANDARD"),
    notes: z.string().max(1000).optional().nullable(),
  })
  .strict()
  .refine(
    (data) => {
      // Italian companies must have vatNumber or taxCode
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
    leadIds: z.array(leadIdSchema).min(1, "Seleziona almeno una lead"),
    assignedUserId: createIdSchema("User ID non valido"),
  })
  .strict();

/**
 * Schema for bulk Lead status update
 */
export const bulkUpdateLeadStatusSchema = z
  .object({
    leadIds: z.array(leadIdSchema).min(1, "Seleziona almeno una lead"),
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
  assignedUserId: createIdSchema("User ID non valido").optional(),
  countryCode: countryCodeBaseSchema.optional(),
  minScore: queryNumberSchema("Score non valido")
    .pipe(z.number().int().min(0).max(100).optional())
    .optional(),
  maxScore: queryNumberSchema("Score non valido")
    .pipe(z.number().int().min(0).max(100).optional())
    .optional(),
  estimatedSize: customerSizeSchema.optional(),
  industry: z.string().optional(),
  bantQualified: queryBooleanSchema,
  privacyConsent: queryBooleanSchema,
  marketingConsent: queryBooleanSchema,
  hasNextFollowUp: queryBooleanSchema,
  campaignName: z.string().optional(),
  createdFrom: isoDateSchema(),
  createdTo: isoDateSchema(),
  lastContactFrom: isoDateSchema(),
  lastContactTo: isoDateSchema(),
  sortBy: z
    .enum([
      "code",
      "companyName",
      "status",
      "quality",
      "score",
      "estimatedValue",
      "nextFollowUpDate",
      "createdAt",
      "lastContactDate",
    ])
    .default("createdAt"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const leadIdParamSchema = z.object({
  id: leadIdSchema,
});

/**
 * Schema for Lead statistics filters
 */
export const leadStatsSchema = z.object({
  assignedUserId: createIdSchema("User ID non valido").optional(),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  source: leadSourceSchema.optional(),
  campaignName: z.string().optional(),
});
