import { z } from "zod";
import {
  createIdSchema,
  InputJsonValueSchema,
  isoDateSchema,
  limitSchema,
  pageSchema,
  PercentageSchema,
  queryPercentageSchema,
  queryPositiveNumberSchema,
  sortOrderSchema,
} from "../utils";

// ============================================================================
// ENUMS
// ============================================================================

export const OpportunityStatusSchema = z.enum([
  "OPEN",
  "WON",
  "LOST",
  "PENDING",
  "CLOSED",
]);

export const SalesStageSchema = z.enum([
  "LEAD_QUALIFICATION",
  "PROSPECTING",
  "NEEDS_ANALYSIS",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "COMMITMENT",
]);

export const OpportunitySortFieldSchema = z.enum([
  "title",
  "estimatedValue",
  "weightedValue",
  "probability",
  "expectedCloseDate",
  "createdAt",
  "lastStageChange",
]);

// ============================================================================
// OPPORTUNITY SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un'opportunità
 */
export const CreateOpportunitySchema = z
  .object({
    title: z
      .string()
      .min(1, "Titolo è obbligatorio")
      .max(255, "Titolo non può superare 255 caratteri")
      .trim(),
    description: z.string().trim().optional(),
    customerId: createIdSchema("Customer ID non valido"),
    status: OpportunityStatusSchema.optional().default("OPEN"),
    stage: SalesStageSchema.optional().default("LEAD_QUALIFICATION"),
    estimatedValue: z
      .number()
      .nonnegative("Valore stimato deve essere >= 0")
      .optional()
      .nullable(),
    probability: PercentageSchema.optional().default(0),
    expectedCloseDate: isoDateSchema(),
    assignedUserId: createIdSchema("User ID non valido").optional().nullable(),
    notes: z.string().trim().optional(),
    customFields: InputJsonValueSchema.optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un'opportunità
 */
export const UpdateOpportunitySchema = CreateOpportunitySchema.omit({
  customerId: true,
})
  .extend({
    closedDate: isoDateSchema(),
    closedReasonId: createIdSchema("ClosedReason ID non valido").optional(),
    closedNotes: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema per cambio stage/status
 */
export const UpdateStageSchema = z
  .object({
    stage: SalesStageSchema,
    probability: PercentageSchema.optional(),
  })
  .strict();

/**
 * Schema per chiusura opportunità (WON)
 */
export const CloseOpportunityWonSchema = z
  .object({
    closedDate: isoDateSchema(),
    closedNotes: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema per chiusura opportunità (LOST)
 */
export const CloseOpportunityLostSchema = z
  .object({
    closedReasonId: createIdSchema("Closed Reason ID non valido")
      .optional()
      .nullable(),
    closedDate: isoDateSchema(),
    closedNotes: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema per ID opportunità nei parametri
 */
export const OpportunityIdSchema = z.object({
  id: createIdSchema("ID opportunità non valido"),
});

/**
 * Schema per Customer ID nei parametri
 */
export const CustomerIdParamSchema = z.object({
  customerId: createIdSchema("Customer ID non valido"),
});

/**
 * Schema per query di ricerca opportunità
 */
export const OpportunityQuerySchema = z
  .object({
    page: pageSchema,
    limit: limitSchema,
    search: z
      .string()
      .trim()
      .min(2, "Ricerca deve contenere almeno 2 caratteri")
      .optional(),
    customerId: createIdSchema("Customer ID non valido").optional(),
    assignedUserId: createIdSchema("Assigned User ID non valido").optional(),
    status: OpportunityStatusSchema.optional(),
    stage: SalesStageSchema.optional(),

    minValue: queryPositiveNumberSchema("Valore minimo deve essere >= 0"),
    maxValue: queryPositiveNumberSchema("Valore massimo deve essere >= 0"),
    minProbability: queryPercentageSchema(
      "Probabilità minima deve essere tra 0 e 100",
    ),
    maxProbability: queryPercentageSchema(
      "Probabilità massima deve essere tra 0 e 100",
    ),
    expectedCloseDateFrom: isoDateSchema(),
    expectedCloseDateTo: isoDateSchema(),

    sortBy: OpportunitySortFieldSchema.optional().default("createdAt"),

    sortOrder: sortOrderSchema,
  })
  .strict();

/**
 * Schema per assegnazione utente
 */
export const AssignUserSchema = z
  .object({
    assignedUserId: createIdSchema("Assigned User ID non valido"),
  })
  .strict();

/**
 * Schema per query di ricerca opportunità per status
 */
export const OpportunityQueryByStatusSchema = z.object({
  status: OpportunityStatusSchema.optional(),
});

/**
 * Schema per creazione ClosedReason
 */
export const CreateClosedReason = z.object({
    code: z.string().trim().max(50).optional().nullable(),
    description: z.string().trim().optional().nullable(),
})

/**
 * Schema per modifica ClosedReason
 */
export const UpdateClosedReason = CreateClosedReason.omit({
    code: true,
})