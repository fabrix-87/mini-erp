import { z } from "zod";
import { handleZodError } from "../helpers/validate";
import {
  validate,
  validateBody,
  validateParams,
} from "../middleware/validation";

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

    customerId: z
      .number()
      .int()
      .positive("Customer ID deve essere un numero intero positivo"),

    status: OpportunityStatusSchema.optional().default("OPEN"),

    stage: SalesStageSchema.optional().default("LEAD_QUALIFICATION"),

    estimatedValue: z
      .number()
      .nonnegative("Valore stimato deve essere >= 0")
      .optional()
      .nullable(),

    probability: z
      .number()
      .int()
      .min(0, "Probabilità deve essere >= 0")
      .max(100, "Probabilità deve essere <= 100")
      .optional()
      .default(0),

    expectedCloseDate: z.iso
      .datetime()
      .optional()
      .nullable()
      .or(z.date().optional().nullable())
      .transform((val) => (val ? new Date(val) : null)),

    assignedUserId: z.number().int().positive().optional().nullable(),

    notes: z.string().trim().optional(),

    customFields: z.record(z.string(), z.any()).optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un'opportunità
 */
export const UpdateOpportunitySchema = z
  .object({
    title: z
      .string()
      .min(1, "Titolo non può essere vuoto")
      .max(255, "Titolo non può superare 255 caratteri")
      .trim()
      .optional(),

    description: z.string().trim().optional(),

    status: OpportunityStatusSchema.optional(),

    stage: SalesStageSchema.optional(),

    estimatedValue: z
      .number()
      .nonnegative("Valore stimato deve essere >= 0")
      .optional()
      .nullable(),

    probability: z
      .number()
      .int()
      .min(0, "Probabilità deve essere >= 0")
      .max(100, "Probabilità deve essere <= 100")
      .optional(),

    expectedCloseDate: z.iso
      .datetime()
      .optional()
      .nullable()
      .or(z.date().optional().nullable())
      .transform((val) => (val ? new Date(val) : null)),

    closedDate: z.iso
      .datetime()
      .optional()
      .nullable()
      .or(z.date().optional().nullable())
      .transform((val) => (val ? new Date(val) : null)),

    closedReasonId: z.number().int().positive().optional().nullable(),

    closedNotes: z.string().trim().optional(),

    assignedUserId: z.number().int().positive().optional().nullable(),

    notes: z.string().trim().optional(),

    customFields: z.record(z.string(), z.any()).optional().nullable(),
  })
  .strict();

/**
 * Schema per cambio stage/status
 */
export const UpdateStageSchema = z
  .object({
    stage: SalesStageSchema,

    probability: z
      .number()
      .int()
      .min(0, "Probabilità deve essere >= 0")
      .max(100, "Probabilità deve essere <= 100")
      .optional(),
  })
  .strict();

/**
 * Schema per chiusura opportunità (WON)
 */
export const CloseOpportunityWonSchema = z
  .object({
    closedDate: z.iso
      .datetime()
      .optional()
      .or(z.date().optional())
      .transform((val) => (val ? new Date(val) : undefined)),

    closedNotes: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema per chiusura opportunità (LOST)
 */
export const CloseOpportunityLostSchema = z
  .object({
    closedReasonId: z.number().int().positive().optional().nullable(),

    closedDate: z.iso
      .datetime()
      .optional()
      .or(z.date().optional())
      .transform((val) => (val ? new Date(val) : undefined)),

    closedNotes: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema per ID opportunità nei parametri
 */
export const OpportunityIdSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: "ID opportunità non valido" }),
});

/**
 * Schema per Customer ID nei parametri
 */
export const CustomerIdParamSchema = z.object({
  customerId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: "Customer ID non valido" }),
});

/**
 * Schema per query di ricerca opportunità
 */
export const OpportunityQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 1, { message: "Numero pagina deve essere >= 1" }),

    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit deve essere tra 1 e 100",
      }),

    search: z
      .string()
      .trim()
      .min(2, "Ricerca deve contenere almeno 2 caratteri")
      .optional(),

    customerId: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val) => val === undefined || val > 0, {
        message: "Customer ID non valido",
      }),

    assignedUserId: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val) => val === undefined || val > 0, {
        message: "Assigned User ID non valido",
      }),

    status: OpportunityStatusSchema.optional(),

    stage: SalesStageSchema.optional(),

    minValue: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .refine((val) => val === undefined || val >= 0, {
        message: "Valore minimo deve essere >= 0",
      }),

    maxValue: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .refine((val) => val === undefined || val >= 0, {
        message: "Valore massimo deve essere >= 0",
      }),

    minProbability: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val) => val === undefined || (val >= 0 && val <= 100), {
        message: "Probabilità minima deve essere tra 0 e 100",
      }),

    maxProbability: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val) => val === undefined || (val >= 0 && val <= 100), {
        message: "Probabilità massima deve essere tra 0 e 100",
      }),

    expectedCloseDateFrom: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    expectedCloseDateTo: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    sortBy: z
      .enum([
        "title",
        "estimatedValue",
        "weightedValue",
        "probability",
        "expectedCloseDate",
        "createdAt",
        "lastStageChange",
      ])
      .optional()
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .strict();

/**
 * Schema per assegnazione utente
 */
export const AssignUserSchema = z
  .object({
    assignedUserId: z
      .number()
      .int()
      .positive("Assigned User ID deve essere un numero intero positivo"),
  })
  .strict();

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

export const validateOpportunityQuery = validateBody(
  OpportunityQuerySchema,
  "Opportunity query"
);

export const validateGetOpportunitiesByCustomer = validateParams(
  CustomerIdParamSchema,
  "Customer ID"
);

export const validateGetOpportunity = validateParams(
  OpportunityIdSchema,
  "Opportunity ID"
);

export const validateCreateOpportunity = validate(
  CreateOpportunitySchema,
  "Opportunity creation"
);

export const validateUpdateOpportunity = validateParams(
  UpdateOpportunitySchema,
  "Opportunity update"
);

export const validateUpdateOpportunityStage = validate(
  UpdateStageSchema,
  "Stage update"
);

export const validateOpportunityWon = validate(
  CloseOpportunityWonSchema,
  "Close won"
);

export const validateOpportunityLost = validate(
  CloseOpportunityLostSchema,
  "Close lost"
);

export const validateOpportunityAssignUser = validate(
  AssignUserSchema,
  "Assign user"
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateOpportunityInput = z.infer<typeof CreateOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof UpdateOpportunitySchema>;
export type UpdateStageInput = z.infer<typeof UpdateStageSchema>;
export type CloseOpportunityWonInput = z.infer<
  typeof CloseOpportunityWonSchema
>;
export type CloseOpportunityLostInput = z.infer<
  typeof CloseOpportunityLostSchema
>;
export type OpportunityQueryInput = z.infer<typeof OpportunityQuerySchema>;
export type AssignUserInput = z.infer<typeof AssignUserSchema>;
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;
export type SalesStage = z.infer<typeof SalesStageSchema>;
