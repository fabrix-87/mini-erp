import { z } from "zod";
import { createIdSchema, positiveNumbersSchema } from "./primitives/id";
import { percentageSchema } from "./business/currency";
import { isoDateSchema } from "./primitives/date";
import { inputJsonValueSchema, userIdSchema } from "./base";
import Decimal from "decimal.js";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import {
  queryPercentageSchema,
  queryPositiveNumberSchema,
} from "./query/params";

// ============================================================================
// ENUMS
// ============================================================================

export const opportunityStatusSchema = z.enum([
  "OPEN",
  "WON",
  "LOST",
  "PENDING",
  "CLOSED",
]);

export const salesStageSchema = z.enum([
  "LEAD_QUALIFICATION",
  "PROSPECTING",
  "NEEDS_ANALYSIS",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "COMMITMENT",
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
// OPPORTUNITY SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un'opportunità
 */
export const createOpportunitySchema = z
  .object({
    title: z
      .string()
      .min(1, "Titolo è obbligatorio")
      .max(255, "Titolo non può superare 255 caratteri")
      .trim(),
    description: z.string().trim().optional(),
    customerId: createIdSchema("Customer ID non valido"),
    status: opportunityStatusSchema.optional().default("OPEN"),
    stage: salesStageSchema.optional().default("LEAD_QUALIFICATION"),
    estimatedValue: positiveNumbersSchema.nullable(),
    probability: percentageSchema.optional().default(new Decimal(0)),
    expectedCloseDate: isoDateSchema(),
    assignedUserId: userIdSchema.optional().nullable(),
    notes: z.string().trim().optional(),
    customFields: inputJsonValueSchema.optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un'opportunità
 */
export const updateOpportunitySchema = createOpportunitySchema
  .omit({
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
export const updateStageSchema = z
  .object({
    stage: salesStageSchema,
    probability: percentageSchema.optional(),
  })
  .strict();

/**
 * Schema per chiusura opportunità (WON)
 */
export const closeOpportunityWonSchema = z
  .object({
    closedDate: isoDateSchema(),
    closedNotes: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema per chiusura opportunità (LOST)
 */
export const closeOpportunityLostSchema = z
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
export const opportunityIdSchema = z.object({
  id: createIdSchema("ID opportunità non valido"),
});

/**
 * Schema per Customer ID nei parametri
 */
export const customerIdParamSchema = z.object({
  customerId: createIdSchema("Customer ID non valido"),
});

/**
 * Schema per query di ricerca opportunità
 */
export const opportunityQuerySchema = z
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
    status: opportunityStatusSchema.optional(),
    stage: salesStageSchema.optional(),

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

    sortBy: opportunitySortFieldSchema.optional().default("createdAt"),

    sortOrder: sortOrderSchema,
  })
  .strict();

/**
 * Schema per assegnazione utente
 */
export const assignUserSchema = z
  .object({
    assignedUserId: createIdSchema("Assigned User ID non valido"),
  })
  .strict();

/**
 * Schema per query di ricerca opportunità per status
 */
export const opportunityQueryByStatusSchema = z.object({
  status: opportunityStatusSchema.optional(),
});

/**
 * Schema per creazione ClosedReason
 */
export const createClosedReason = z.object({
  code: z.string().trim().max(50).optional().nullable(),
  description: z.string().trim().optional().nullable(),
});

/**
 * Schema per modifica ClosedReason
 */
export const updateClosedReason = createClosedReason.omit({
  code: true,
});
