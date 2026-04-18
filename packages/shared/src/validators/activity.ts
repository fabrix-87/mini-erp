import z from "zod";

import { userIdSchema } from "./base";
import { isoDateSchema } from "./primitives/date";
import { createIdSchema, positiveNumbersSchema } from "./primitives/id";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import { queryBooleanSchema } from "./query/params";
import { emailSchema } from "./primitives/string";

// ============================================================================
// ENUMS
// ============================================================================

export const activityTypeSchema = z.enum([
  "CALL",
  "EMAIL",
  "MEETING",
  "TASK",
  "NOTE",
  "WHATSAPP",
  "SMS",
  "VIDEO_CALL",
  "SITE_VISIT",
  "OTHER",
]);

export const activityStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
  "NO_SHOW",
]);

export const activityPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const activityOutcomeSchema = z.enum([
  "SUCCESSFUL",
  "NO_ANSWER",
  "LEFT_MESSAGE",
  "FOLLOW_UP_NEEDED",
  "NOT_INTERESTED",
  "WRONG_CONTACT",
  "CALLBACK_LATER",
  "POSTPONED",
  "OTHER",
]);

export const participantStatusSchema = z.enum([
  "invited",
  "accepted",
  "declined",
  "tentative",
  "attended",
  "no_show",
]);

export const participantRoleSchema = z.enum(["organizer", "required", "optional"]);

// ============================================================================
// ACTIVITY SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una Activity
 */
export const createActivitySchema = z
  .object({
    // Tipo e priorità
    type: activityTypeSchema,
    status: activityStatusSchema.default("SCHEDULED"),
    priority: activityPrioritySchema.default("MEDIUM"),
    outcome: activityOutcomeSchema.optional().nullable(),

    // Informazioni base
    subject: z
      .string()
      .min(1, "Il subject è obbligatorio")
      .max(255, "Il subject non può superare 255 caratteri")
      .trim(),
    description: z.string().optional().nullable(),
    location: z.string().max(255).optional().nullable(),

    // Date e durata
    scheduledStart: z.iso.datetime("Data inizio non valida"),
    scheduledEnd: isoDateSchema({ message: "Data fine non valida" }),
    actualStart: isoDateSchema({ message: "Data inizio effettiva non valida" }),
    actualEnd: isoDateSchema({ message: "Data fine effettiva non valida" }),
    duration: positiveNumbersSchema.optional().nullable(),

    // Promemoria
    reminderMinutes: positiveNumbersSchema.optional().nullable(),
    reminderSent: z.boolean().default(false),

    // Relazioni
    companyId: positiveNumbersSchema.optional().nullable(),
    customerId: positiveNumbersSchema.optional().nullable(),
    contactId: positiveNumbersSchema.optional().nullable(),
    opportunityId: positiveNumbersSchema.optional().nullable(),
    leadId: positiveNumbersSchema.optional().nullable(),

    // Utente assegnato (obbligatorio)
    assignedUserId: userIdSchema,

    // Follow-up
    followUpActivityId: positiveNumbersSchema.optional().nullable(),

    // Allegati e note
    attachments: z.any().optional().nullable(),
    internalNotes: z.string().optional().nullable(),
    result: z.string().optional().nullable(),
    customFields: z.any().optional().nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di una Activity
 */
export const updateActivitySchema = createActivitySchema
  .omit({
    assignedUserId: true,
  })
  .partial()
  .strict();

/**
 * Schema per la validazione dell'ID activity
 */
const activityIdBaseSchema = createIdSchema("Activity ID non valido");

export const activityIdSchema = z.object({
  id: activityIdBaseSchema,
});

export const activityIdAsActivityIdSchema = z.object({
  activityId: activityIdBaseSchema,
});

/**
 * Schema per query parameters
 */
export const activityQuerySchema = z
  .object({
    page: pageSchema,
    limit: limitSchema,
    search: z.string().optional(),

    // Filtri
    type: activityTypeSchema.optional(),
    status: activityStatusSchema.optional(),
    priority: activityPrioritySchema.optional(),
    outcome: activityOutcomeSchema.optional(),

    companyId: createIdSchema("CompanyId non valido").optional(),
    customerId: createIdSchema("CustomerId non valido").optional(),
    opportunityId: createIdSchema("OpportunityId non valido").optional(),
    assignedUserId: createIdSchema("Assigned User ID non valido").optional(),
    leadId: createIdSchema("Lead ID non valido").optional(),

    // Filtri data
    startDate: isoDateSchema({ message: "Data inizio non valida" }),
    endDate: isoDateSchema({ message: "Data fine non valida" }),

    // Filtri speciali
    overdue: queryBooleanSchema,
    hasFollowUpActivity: queryBooleanSchema,
    myActivities: queryBooleanSchema, // Solo le mie attività

    sortBy: z.string().default("scheduledStart"),
    sortOrder: sortOrderSchema,
  })
  .partial({
    startDate: true,
    endDate: true,
    companyId: true,
    customerId: true,
    opportunityId: true,
    assignedUserId: true,
  })
  .strict();

/**
 * Schema per aggiornare lo status
 */
export const updateActivityStatusSchema = z
  .object({
    status: activityStatusSchema,
    outcome: activityOutcomeSchema.optional().nullable(),
    result: z.string().optional().nullable(),
    actualStart: z.iso.datetime().optional().nullable(),
    actualEnd: z.iso.datetime().optional().nullable(),
  })
  .strict();

/**
 * Schema per completare un'attività con opzione di creare follow-up activity
 */
export const completeActivitySchema = z
  .object({
    outcome: activityOutcomeSchema,
    result: z.string().optional().nullable(),
    internalNotes: z.string().optional().nullable(),
    // If provided, a follow-up Activity will be created automatically
    followUp: z
      .object({
        type: activityTypeSchema,
        subject: z.string().min(1).max(255).trim(),
        scheduledStart: z.iso.datetime("Data follow-up non valida"),
        assignedUserId: userIdSchema.optional(), // default: stessa persona
        priority: activityPrioritySchema.default("MEDIUM"),
        description: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),
  })
  .strict();

// ============================================================================
// ACTIVITY PARTICIPANT SCHEMAS
// ============================================================================

/**
 * Schema per aggiungere un partecipante
 */
export const createActivityParticipantSchema = z
  .object({
    activityId: createIdSchema("Activity ID non valido"),

    // Uno dei tre deve essere presente
    userId: userIdSchema.optional().nullable(),
    contactId: createIdSchema("ID contatto non valido").optional().nullable(),

    // Per partecipanti esterni
    externalEmail: emailSchema().optional().nullable(),
    externalName: z.string().max(255).optional().nullable(),

    status: participantStatusSchema.default("invited"),
    role: participantRoleSchema.default("optional"),
    notes: z.string().optional().nullable(),
  })
  .strict()
  .refine(
    (data) => {
      // Almeno uno tra userId, contactId o externalEmail deve essere presente
      return data.userId || data.contactId || data.externalEmail;
    },
    {
      message: "Specificare almeno un partecipante (userId, contactId o externalEmail)",
      path: ["userId"],
    },
  );

/**
 * Schema per aggiornare un partecipante
 */
export const updateActivityParticipantSchema = z
  .object({
    status: participantStatusSchema.optional(),
    role: participantRoleSchema.optional(),
    notes: z.string().optional().nullable(),
  })
  .strict();

/**
 * Schema per la validazione dell'ID participant
 */
export const activityParticipantIdSchema = z.object({
  id: createIdSchema("ID partecipante non valido"),
});

// ============================================================================
// ACTIVITY TEMPLATE SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Activity Template
 */
export const createActivityTemplateSchema = z
  .object({
    name: z.string().min(1, "Il nome è obbligatorio").max(255).trim(),
    description: z.string().optional().nullable(),

    type: activityTypeSchema,
    priority: activityPrioritySchema.default("MEDIUM"),

    defaultDuration: positiveNumbersSchema,
    defaultSubject: z.string().max(255).trim(),
    defaultDescription: z.string().optional().nullable(),

    checklist: z.any().optional().nullable(),
    active: z.boolean().default(true),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Activity Template
 */
export const updateActivityTemplateSchema = createActivityTemplateSchema.partial().strict();

/**
 * Schema per la validazione dell'ID template
 */
export const activityTemplateIdSchema = z.object({
  id: createIdSchema("ID template non valido"),
});

/**
 * Schema per creare activity da template
 */
export const createActivityFromTemplateSchema = z
  .object({
    templateId: createIdSchema("ID template obbligatorio"),
    scheduledStart: isoDateSchema({
      required: true,
      message: "Data inizio obbligatoria",
    }),
    scheduledEnd: isoDateSchema().optional().nullable(),

    // Override opzionali
    subject: z.string().max(255).optional().nullable(),
    description: z.string().optional().nullable(),

    // Relazioni obbligatorie
    companyId: positiveNumbersSchema,
    customerId: positiveNumbersSchema,
    opportunityId: positiveNumbersSchema,
    assignedUserId: userIdSchema,
  })
  .strict()
  .refine(
    (data) => {
      return data.companyId || data.customerId || data.opportunityId;
    },
    {
      message: "Almeno una relazione è obbligatoria",
      path: ["companyId"],
    },
  );

/**
 * Schema per le statistiche utente
 */
export const activityStatsSchema = z.object({
  startDate: isoDateSchema(),
  endDate: isoDateSchema(),
  userId: userIdSchema.optional(),
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Schema per operazioni bulk
 */
export const bulkActivityActionSchema = z
  .object({
    activityIds: z.array(activityIdBaseSchema).min(1, "Almeno un ID è obbligatorio"),
    action: z.enum(["complete", "cancel", "delete", "reassign"]),

    // Campi opzionali in base all'azione
    assignedUserId: userIdSchema.optional(), // Per reassign
    outcome: activityOutcomeSchema.optional(), // Per complete
    result: z.string().optional().nullable(), // Per complete
  })
  .strict();
