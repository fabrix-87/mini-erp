import { z } from "zod";
import { validateQuery } from "../middleware/validation";

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
    scheduledStart: z.string().datetime("Data inizio non valida"),
    scheduledEnd: z
      .string()
      .datetime("Data fine non valida")
      .optional()
      .nullable(),
    actualStart: z
      .string()
      .datetime("Data inizio effettiva non valida")
      .optional()
      .nullable(),
    actualEnd: z
      .string()
      .datetime("Data fine effettiva non valida")
      .optional()
      .nullable(),
    duration: z
      .number()
      .int()
      .positive("La durata deve essere positiva")
      .optional()
      .nullable(),

    // Promemoria
    reminderMinutes: z.number().int().positive().optional().nullable(),
    reminderSent: z.boolean().default(false),

    // Relazioni
    companyId: z.number().int().positive().optional().nullable(),
    customerId: z.number().int().positive().optional().nullable(),
    contactId: z.number().int().positive().optional().nullable(),
    opportunityId: z.number().int().positive().optional().nullable(),

    // Utente assegnato (obbligatorio)
    assignedUserId: z.number().int().positive("Utente assegnato obbligatorio"),

    // Follow-up
    requiresFollowUp: z.boolean().default(false),
    followUpDate: z.string().datetime().optional().nullable(),
    followUpActivityId: z.number().int().positive().optional().nullable(),

    // Allegati e note
    attachments: z.any().optional().nullable(),
    internalNotes: z.string().optional().nullable(),
    result: z.string().optional().nullable(),
    customFields: z.any().optional().nullable(),
  })
  .strict()
  .refine(
    (data) => {
      // Se scheduledEnd è fornito, deve essere dopo scheduledStart
      if (data.scheduledEnd) {
        return new Date(data.scheduledEnd) > new Date(data.scheduledStart);
      }
      return true;
    },
    {
      message: "La data di fine deve essere successiva alla data di inizio",
      path: ["scheduledEnd"],
    }
  )
  .refine(
    (data) => {
      // Almeno una relazione (company, customer o opportunity) deve essere presente
      return data.companyId || data.customerId || data.opportunityId;
    },
    {
      message:
        "Almeno una relazione (company, customer o opportunity) è obbligatoria",
      path: ["companyId"],
    }
  );

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
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "ID activity non valido"),
});

/**
 * Schema per query parameters
 */
export const ActivityQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20)),
    search: z.string().optional(),

    // Filtri
    type: ActivityTypeSchema.optional(),
    status: ActivityStatusSchema.optional(),
    priority: ActivityPrioritySchema.optional(),
    outcome: ActivityOutcomeSchema.optional(),

    companyId: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    customerId: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    opportunityId: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    assignedUserId: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),

    // Filtri data
    startDate: z.string().datetime("Data inizio non valida").optional(),
    endDate: z.string().datetime("Data fine non valida").optional(),

    // Filtri speciali
    overdue: z
      .string()
      .optional()
      .transform((val) => val === "true"),
    requiresFollowUp: z
      .string()
      .optional()
      .transform((val) => val === "true"),
    myActivities: z
      .string()
      .optional()
      .transform((val) => val === "true"), // Solo le mie attività

    sortBy: z.string().default("scheduledStart"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
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
    actualStart: z.string().datetime().optional().nullable(),
    actualEnd: z.string().datetime().optional().nullable(),
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
    followUpDate: z.string().datetime().optional().nullable(),
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
    activityId: z.number().int().positive("ID activity obbligatorio"),

    // Uno dei tre deve essere presente
    userId: z.number().int().positive().optional().nullable(),
    contactId: z.number().int().positive().optional().nullable(),

    // Per partecipanti esterni
    externalEmail: z
      .string()
      .email("Email non valida")
      .max(255)
      .optional()
      .nullable(),
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
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "ID participant non valido"),
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

    defaultDuration: z.number().int().positive().optional().nullable(),
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
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "ID template non valido"),
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
    companyId: z.number().int().positive().optional().nullable(),
    customerId: z.number().int().positive().optional().nullable(),
    opportunityId: z.number().int().positive().optional().nullable(),
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
  startDate: z.iso.datetime().optional().nullable(),
  endDate: z.iso.datetime().optional().nullable(),
  userId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
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

// ============================================================================
// MIDDLEWARE
// ============================================================================

export const validateActivityStatsQuery = validateQuery(
  ActivityStatsSchema,
  "Company search"
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
export type ActivityQueryInput = z.infer<typeof ActivityQuerySchema>;
export type ActivityStatsInput = z.infer<typeof ActivityStatsSchema>;
export type UpdateActivityStatusInput = z.infer<
  typeof UpdateActivityStatusSchema
>;
export type CompleteActivityInput = z.infer<typeof CompleteActivitySchema>;
export type CreateActivityParticipantInput = z.infer<
  typeof CreateActivityParticipantSchema
>;
export type UpdateActivityParticipantInput = z.infer<
  typeof UpdateActivityParticipantSchema
>;
export type CreateActivityTemplateInput = z.infer<
  typeof CreateActivityTemplateSchema
>;
export type UpdateActivityTemplateInput = z.infer<
  typeof UpdateActivityTemplateSchema
>;
export type CreateActivityFromTemplateInput = z.infer<
  typeof CreateActivityFromTemplateSchema
>;
export type BulkActivityActionInput = z.infer<typeof BulkActivityActionSchema>;
export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type ActivityStatus = z.infer<typeof ActivityStatusSchema>;
export type ActivityPriority = z.infer<typeof ActivityPrioritySchema>;
export type ActivityOutcome = z.infer<typeof ActivityOutcomeSchema>;
