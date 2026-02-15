import { z } from "zod";

import { User } from "./user";
import { Contact } from "./contact";
import { Company } from "./company";
import { Customer } from "./customer";
import { Opportunity } from "./opportunity";
import {
  activityOutcomeSchema,
  activityPrioritySchema,
  activityQuerySchema,
  activityStatsSchema,
  activityStatusSchema,
  activityTypeSchema,
  bulkActivityActionSchema,
  completeActivitySchema,
  createActivityFromTemplateSchema,
  createActivityParticipantSchema,
  createActivitySchema,
  createActivityTemplateSchema,
  participantRoleSchema,
  participantStatusSchema,
  updateActivityParticipantSchema,
  updateActivitySchema,
  updateActivityStatusSchema,
  updateActivityTemplateSchema,
} from "../validators";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Type Activity
 */
export type Activity = z.infer<typeof createActivitySchema> & {
  id: number;
  company?: Company;
  customer?: Customer;
  contact?: Contact;
  opportunity?: Opportunity;
  assignedUser: User;
  createdBy: User;
  partecipants?: ActivityParticipant[];
  followUpActivity: Activity;
  followedUpBy: Activity[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Type ActivityPartecipant
 */
export type ActivityParticipant = z.infer<
  typeof createActivityParticipantSchema
> & {
  id: number;

  // Relazioni
  activity?: Activity[];
  user?: User[];
  contact?: Contact[];

  responseDate?: Date;

  createdAt: Date;
  updatedAt: Date;
};

/**
 * Type ActivityTemplate
 */
export type ActivityTemplate = z.infer<typeof createActivityTemplateSchema> & {
  id: number;

  createdAt: Date;
  updatedAt: Date;
};

/**
 * Type Form values per Activity
 */
export type ActivityFormData = {
  customerId: string;
  contactId: string;
  type: ActivityType;
  subject: string;
  description: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  scheduledStart: string;
  scheduledEnd?: string;
  duration?: string;
  reminderMinutes?: string;
  location: string;
  outcome?: ActivityOutcome | string;
  result?: string;
  internalNotes?: string;
  requiresFollowUp: boolean;
  followUpDate?: string;
  customFields?: any;
};

export type ActivityType = z.infer<typeof activityTypeSchema>;
export type ActivityStatus = z.infer<typeof activityStatusSchema>;
export type ActivityPriority = z.infer<typeof activityPrioritySchema>;
export type ActivityOutcome = z.infer<typeof activityOutcomeSchema>;
export type ParticipantStatus = z.infer<typeof participantStatusSchema>;
export type ParticipantRole = z.infer<typeof participantRoleSchema>;

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
export type ActivityStatsInput = z.infer<typeof activityStatsSchema>;
export type UpdateActivityStatusInput = z.infer<
  typeof updateActivityStatusSchema
>;
export type CompleteActivityInput = z.infer<typeof completeActivitySchema>;
export type CreateActivityParticipantInput = z.infer<
  typeof createActivityParticipantSchema
>;
export type UpdateActivityParticipantInput = z.infer<
  typeof updateActivityParticipantSchema
>;
export type CreateActivityTemplateInput = z.infer<
  typeof createActivityTemplateSchema
>;
export type UpdateActivityTemplateInput = z.infer<
  typeof updateActivityTemplateSchema
>;
export type CreateActivityFromTemplateInput = z.infer<
  typeof createActivityFromTemplateSchema
>;
export type BulkActivityActionInput = z.infer<typeof bulkActivityActionSchema>;
