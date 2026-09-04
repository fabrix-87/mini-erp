import { z } from "zod";
import { createCuidSchema } from "./primitives/id";
import { isoDateSchema } from "./primitives/date";
import {
  customerIdBaseSchema,
  inputJsonValueSchema,
  leadIdBaseSchema,
  opportunityIdBaseSchema,
  productIdBaseSchema,
  userIdSchema,
} from "./base";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import { queryBooleanSchema, queryNumberSchema } from "./query/params";
import { createDecimalSchema } from "./primitives";

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Opportunity Status enum
 */
export const opportunityStatusSchema = z.enum(["OPEN", "WON", "LOST", "PENDING", "CLOSED"]);

/**
 * Sales Stage enum
 */
export const salesStageSchema = z.enum([
  "LEAD_QUALIFICATION",
  "PROSPECTING",
  "NEEDS_ANALYSIS",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "COMMITMENT",
]);

/**
 * Opportunity Source enum
 */
export const opportunitySourceSchema = z.enum([
  "LEAD",
  "CUSTOMER",
  "INBOUND",
  "OUTBOUND",
  "REFERRAL",
  "PARTNER",
  "EVENT",
  "OTHER",
]);

export const opportunitySortFieldSchema = z.enum([
  "title",
  "estimatedValue",
  "weightedValue",
  "probability",
  "expectedCloseDate",
  "createdAt",
  "lastStageChange",
]);

// ============================================================================
// DECIMAL HELPERS
// ============================================================================

/**
 * Schema for opportunity value (15, 2)
 */
const opportunityValueSchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: 0,
});

/**
 * Schema for probability (0-100)
 */
const probabilitySchema = z
  .number()
  .int("Probabilità deve essere un intero")
  .min(0, "Probabilità minima è 0")
  .max(100, "Probabilità massima è 100")
  .default(0);

// ============================================================================
// CLOSED REASON SCHEMAS
// ============================================================================

/**
 * Schema for Closed Reason ID
 */
export const closedReasonIdSchema = createCuidSchema("ID Closed Reason non valido");

/**
 * Schema for creating a Closed Reason
 */
export const createClosedReasonSchema = z
  .object({
    code: z
      .string()
      .min(1, "Codice obbligatorio")
      .max(50, "Codice max 50 caratteri")
      .trim()
      .toUpperCase(),

    description: z
      .string()
      .min(1, "Descrizione obbligatoria")
      .max(255, "Descrizione max 255 caratteri")
      .trim(),

    isWon: z.boolean(),

    active: z.boolean().default(true),

    displayOrder: z.number().int().nonnegative().default(0),
  })
  .strict();

/**
 * Schema for updating a Closed Reason
 */
export const updateClosedReasonSchema = createClosedReasonSchema
  .omit({ code: true })
  .partial()
  .strict();

// ============================================================================
// OPPORTUNITY SCHEMAS
// ============================================================================

/**
 * Schema for proposed product item
 */
export const proposedProductSchema = z
  .object({
    productId: productIdBaseSchema,
    productName: z.string().optional(),
    quantity: createDecimalSchema(2, { positiveOnly: true, min: 0 }),
    price: createDecimalSchema(2, { positiveOnly: true, min: 0 }),
    discount: createDecimalSchema(2, { min: 0, max: 100, defaultValue: 0 }),
    total: createDecimalSchema(2, { positiveOnly: true }).optional(),
    notes: z.string().max(500).optional().nullable(),
  })
  .strict();

/**
 * Raw object shape for Opportunity — no refinements, no strict.
 * Used as base for both create and update schemas.
 */
export const opportunityShape = z.object({
  title: z
    .string()
    .min(1, "Titolo è obbligatorio")
    .max(255, "Titolo non può superare 255 caratteri")
    .trim(),
  description: z.string().max(5000).optional().nullable(),

  // Relations
  leadId: leadIdBaseSchema.optional().nullable(),
  customerId: customerIdBaseSchema,
  source: opportunitySourceSchema.default("OTHER"),

  // Status and stage
  status: opportunityStatusSchema.default("OPEN"),
  stage: salesStageSchema.default("LEAD_QUALIFICATION"),

  // Financial metrics
  estimatedValue: opportunityValueSchema.optional().nullable(),
  probability: probabilitySchema,
  weightedValue: opportunityValueSchema.optional(),

  // Timing
  expectedCloseDate: isoDateSchema(),

  // Assignment
  assignedUserId: userIdSchema.optional().nullable(),

  // Products/Services
  proposedProducts: z.array(proposedProductSchema).optional().nullable().default([]),

  notes: z.string().trim().optional(),
  customFields: inputJsonValueSchema.optional().nullable(),
});

/**
 * Schema for creating an Opportunity.
 * The refine here is a no-op placeholder — weightedValue is auto-calculated
 * in the service layer. Kept as documentation intent only.
 */
export const createOpportunitySchema = opportunityShape.strict();

/**
 * Schema for updating an Opportunity — partial, without immutable FK fields.
 * customerId and leadId are immutable after creation.
 */
export const updateOpportunitySchema = opportunityShape
  .omit({ customerId: true, leadId: true })
  .partial()
  .strict();

/**
 * Schema for updating Opportunity stage
 */
export const updateOpportunityStageSchema = z
  .object({
    stage: salesStageSchema,
    probability: probabilitySchema.optional(),
    notes: z.string().max(1000).optional().nullable(),
  })
  .strict();

/**
 * Raw shape for status update — no refinements.
 */
const opportunityStatusShape = z.object({
  status: opportunityStatusSchema,
  closedReasonId: closedReasonIdSchema.optional().nullable(),
  closedNotes: z.string().max(1000).optional().nullable(),
  actualValue: opportunityValueSchema.optional().nullable(),
});

/**
 * Schema for updating Opportunity status — includes cross-field refinements
 * for WON/LOST validation.
 */
export const updateOpportunityStatusSchema = opportunityStatusShape
  .strict()
  .refine(
    (data) => {
      if ((data.status === "WON" || data.status === "LOST") && !data.closedReasonId) {
        return false;
      }
      return true;
    },
    {
      message: "Motivo chiusura obbligatorio per opportunità vinte o perse",
      path: ["closedReasonId"],
    },
  )
  .refine(
    (data) => {
      if (data.status === "WON" && !data.actualValue) {
        return false;
      }
      return true;
    },
    {
      message: "Valore effettivo obbligatorio per opportunità vinte",
      path: ["actualValue"],
    },
  );

/**
 * Schema for winning an Opportunity
 */
export const winOpportunitySchema = z
  .object({
    actualValue: opportunityValueSchema,
    closedReasonId: closedReasonIdSchema,
    closedNotes: z.string().max(1000).optional().nullable(),
    closedDate: isoDateSchema().optional(),
  })
  .strict();

/**
 * Schema for losing an Opportunity
 */
export const loseOpportunitySchema = z
  .object({
    closedReasonId: closedReasonIdSchema,
    closedNotes: z.string().max(1000).optional().nullable(),
    closedDate: isoDateSchema().optional(),
  })
  .strict();

/**
 * Schema per Customer ID nei parametri
 */
export const customerIdParamSchema = z.object({
  customerId: customerIdBaseSchema,
});

/**
 * Schema for bulk assigning Opportunities
 */
export const bulkAssignOpportunitiesSchema = z
  .object({
    opportunityIds: z.array(opportunityIdBaseSchema).min(1, "Seleziona almeno un'opportunità"),
    assignedUserId: userIdSchema,
  })
  .strict();

/**
 * Schema for bulk stage update
 */
export const bulkUpdateStageSchema = z
  .object({
    opportunityIds: z.array(opportunityIdBaseSchema).min(1, "Seleziona almeno un'opportunità"),
    stage: salesStageSchema,
    probability: probabilitySchema.optional(),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema for Opportunity queries
 */
export const opportunityQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  status: opportunityStatusSchema.optional(),
  stage: salesStageSchema.optional(),
  source: opportunitySourceSchema.optional(),
  customerId: customerIdBaseSchema.optional(),
  leadId: leadIdBaseSchema.optional(),
  assignedUserId: userIdSchema.optional(),
  createdByUserId: userIdSchema.optional(),
  minValue: queryNumberSchema("Valore non valido")
    .pipe(z.number().nonnegative().optional())
    .optional(),
  maxValue: queryNumberSchema("Valore non valido")
    .pipe(z.number().nonnegative().optional())
    .optional(),
  minProbability: queryNumberSchema("Probabilità non valida")
    .pipe(z.number().int().min(0).max(100).optional())
    .optional(),
  maxProbability: queryNumberSchema("Probabilità non valida")
    .pipe(z.number().int().min(0).max(100).optional())
    .optional(),
  expectedCloseFrom: isoDateSchema(),
  expectedCloseTo: isoDateSchema(),
  closedFrom: isoDateSchema(),
  closedTo: isoDateSchema(),
  isStagnant: queryBooleanSchema, // Opportunities that haven't progressed
  hasActivities: queryBooleanSchema,
  sortBy: z
    .enum([
      "id",
      "title",
      "status",
      "stage",
      "estimatedValue",
      "weightedValue",
      "probability",
      "expectedCloseDate",
      "closedDate",
      "createdAt",
      "lastActivityDate",
    ])
    .default("createdAt"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema for Closed Reason queries
 */
export const closedReasonQuerySchema = z.object({
  isWon: z.boolean().optional(),
  active: z.boolean().optional(),
  sortBy: z.enum(["id", "code", "displayOrder", "createdAt"]).default("displayOrder"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const opportunityIdParamSchema = z.object({
  id: opportunityIdBaseSchema,
});

export const closedReasonIdParamSchema = z.object({
  id: closedReasonIdSchema,
});

/**
 * Schema for Opportunity statistics filters
 */
export const opportunityStatsSchema = z.object({
  assignedUserId: userIdSchema.optional(),
  customerId: customerIdBaseSchema.optional(),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  source: opportunitySourceSchema.optional(),
});

/**
 * Schema for sales funnel analysis
 */
export const salesFunnelAnalysisSchema = z.object({
  assignedUserId: userIdSchema.optional(),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  groupBy: z.enum(["stage", "source", "assignedUser", "month"]).default("stage"),
});
