import z from "zod";
import { createIdSchema, emailSchema, isoDateSchema, limitSchema, pageSchema, positiveNumbersSchema, QueryBooleanSchema, sortOrderSchema } from "../utils";
import { UserIdSchema } from "./base";

// ============================================================================
// ENUMS
// ============================================================================

export const ActivityTypeSchema = z.enum([
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

export const ActivityStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
  "NO_SHOW",
]);

export const ActivityPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const ActivityOutcomeSchema = z.enum([
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

export const ParticipantStatusSchema = z.enum([
  "invited",
  "accepted",
  "declined",
  "tentative",
  "attended",
  "no_show",
]);

export const ParticipantRoleSchema = z.enum([
  "organizer",
  "required",
  "optional",
]);

// ============================================================================
// ACTIVITY SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di una Activity
 */
export const CreateActivitySchema = z
  .object({
    // Tipo e priorità
    type: ActivityTypeSchema,
    status: ActivityStatusSchema.default("SCHEDULED"),
    priority: ActivityPrioritySchema.default("MEDIUM"),
    outcome: ActivityOutcomeSchema.optional().nullable(),

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
    scheduledEnd: isoDateSchema({message: "Data fine non valida"}),
    actualStart: isoDateSchema({message: "Data inizio effettiva non valida"}),
    actualEnd: isoDateSchema({message: "Data fine effettiva non valida"}),
    duration: isoDateSchema({message: "La durata deve essere positiva"}),

    // Promemoria
    reminderMinutes: positiveNumbersSchema,
    reminderSent: z.boolean().default(false),

    // Relazioni
    companyId: positiveNumbersSchema,
    customerId: positiveNumbersSchema,
    contactId: positiveNumbersSchema,
    opportunityId: positiveNumbersSchema,

    // Utente assegnato (obbligatorio)
    assignedUserId: z.number().int().positive("Utente assegnato obbligatorio"),

    // Follow-up
    requiresFollowUp: z.boolean().default(false),
    followUpDate: isoDateSchema(),
    followUpActivityId: positiveNumbersSchema,

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
export const UpdateActivitySchema = CreateActivitySchema.omit({
  assignedUserId: true,
})
  .partial()
  .strict();

/**
 * Schema per la validazione dell'ID activity
 */
export const ActivityIdSchema = z.object({
  id: createIdSchema("Activity ID non valido"),
});
export const ActivityIdAsActivityIdSchema = z.object({
  activityId: createIdSchema("Activity ID non valido"),
});

/**
 * Schema per query parameters
 */
export const ActivityQuerySchema = z
  .object({
    page: pageSchema,
    limit: limitSchema,
    search: z.string().optional(),

    // Filtri
    type: ActivityTypeSchema.optional(),
    status: ActivityStatusSchema.optional(),
    priority: ActivityPrioritySchema.optional(),
    outcome: ActivityOutcomeSchema.optional(),

    companyId: createIdSchema("CompanyId non valido").optional(),
    customerId: createIdSchema("CustomerId non valido").optional(),
    opportunityId: createIdSchema("OpportunityId non valido").optional(),
    assignedUserId: createIdSchema("Assigned User ID non valido").optional(),

    // Filtri data
    startDate: isoDateSchema({message: "Data inizio non valida"}),
    endDate: isoDateSchema({message: "Data fine non valida"}),

    // Filtri speciali
    overdue: QueryBooleanSchema,
    requiresFollowUp: QueryBooleanSchema,
    myActivities: QueryBooleanSchema, // Solo le mie attività

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
export const UpdateActivityStatusSchema = z
  .object({
    status: ActivityStatusSchema,
    outcome: ActivityOutcomeSchema.optional().nullable(),
    result: z.string().optional().nullable(),
    actualStart: z.iso.datetime().optional().nullable(),
    actualEnd: z.iso.datetime().optional().nullable(),
  })
  .strict();

/**
 * Schema per completare un'attività
 */
export const CompleteActivitySchema = z
  .object({
    outcome: ActivityOutcomeSchema,
    result: z.string().optional().nullable(),
    requiresFollowUp: z.boolean().default(false),
    followUpDate: z.iso.datetime().optional().nullable(),
    internalNotes: z.string().optional().nullable(),
  })
  .strict();

// ============================================================================
// ACTIVITY PARTICIPANT SCHEMAS
// ============================================================================

/**
 * Schema per aggiungere un partecipante
 */
export const CreateActivityParticipantSchema = z
  .object({
    activityId: createIdSchema("Activity ID non valido"),

    // Uno dei tre deve essere presente
    userId: UserIdSchema.optional().nullable(),
    contactId: createIdSchema("ID contatto non valido").optional().nullable(),

    // Per partecipanti esterni
    externalEmail: emailSchema().optional().nullable(),
    externalName: z.string().max(255).optional().nullable(),

    status: ParticipantStatusSchema.default("invited"),
    role: ParticipantRoleSchema.default("optional"),
    notes: z.string().optional().nullable(),
  })
  .strict()
  .refine(
    (data) => {
      // Almeno uno tra userId, contactId o externalEmail deve essere presente
      return data.userId || data.contactId || data.externalEmail;
    },
    {
      message:
        "Specificare almeno un partecipante (userId, contactId o externalEmail)",
      path: ["userId"],
    }
  );

/**
 * Schema per aggiornare un partecipante
 */
export const UpdateActivityParticipantSchema = z
  .object({
    status: ParticipantStatusSchema.optional(),
    role: ParticipantRoleSchema.optional(),
    notes: z.string().optional().nullable(),
  })
  .strict();

/**
 * Schema per la validazione dell'ID participant
 */
export const ActivityParticipantIdSchema = z.object({
  id: createIdSchema("ID partecipante non valido"),
});

// ============================================================================
// ACTIVITY TEMPLATE SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un Activity Template
 */
export const CreateActivityTemplateSchema = z
  .object({
    name: z.string().min(1, "Il nome è obbligatorio").max(255).trim(),
    description: z.string().optional().nullable(),

    type: ActivityTypeSchema,
    priority: ActivityPrioritySchema.default("MEDIUM"),

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
export const UpdateActivityTemplateSchema =
  CreateActivityTemplateSchema.partial().strict();

/**
 * Schema per la validazione dell'ID template
 */
export const ActivityTemplateIdSchema = z.object({
  id: createIdSchema("ID template non valido"),
});

/**
 * Schema per creare activity da template
 */
export const CreateActivityFromTemplateSchema = z
  .object({
    templateId: z.number().int().positive("ID template obbligatorio"),
    scheduledStart: z.iso.datetime("Data inizio obbligatoria"),
    scheduledEnd: z.iso.datetime().optional().nullable(),

    // Override opzionali
    subject: z.string().max(255).optional().nullable(),
    description: z.string().optional().nullable(),

    // Relazioni obbligatorie
    companyId: positiveNumbersSchema,
    customerId: positiveNumbersSchema,
    opportunityId: positiveNumbersSchema,
    assignedUserId: z.number().int().positive("Utente assegnato obbligatorio"),
  })
  .strict()
  .refine(
    (data) => {
      return data.companyId || data.customerId || data.opportunityId;
    },
    {
      message: "Almeno una relazione è obbligatoria",
      path: ["companyId"],
    }
  );

/**
 * Schema per le statistiche utente
 */
export const ActivityStatsSchema = z.object({
  startDate: isoDateSchema(),
  endDate: isoDateSchema(),
  userId: UserIdSchema.optional()
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Schema per operazioni bulk
 */
export const BulkActivityActionSchema = z
  .object({
    activityIds: z
      .array(z.number().int().positive())
      .min(1, "Almeno un ID è obbligatorio"),
    action: z.enum(["complete", "cancel", "delete", "reassign"]),

    // Campi opzionali in base all'azione
    assignedUserId: z.number().int().positive().optional(), // Per reassign
    outcome: ActivityOutcomeSchema.optional(), // Per complete
    result: z.string().optional().nullable(), // Per complete
  })
  .strict();
