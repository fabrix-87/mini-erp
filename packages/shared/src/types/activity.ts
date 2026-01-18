import z from "zod";

import {
    ActivityOutcomeSchema,
    ActivityPrioritySchema,
    ActivityQuerySchema,
    ActivityStatsSchema,
    ActivityStatusSchema,
    ActivityTypeSchema,
    BulkActivityActionSchema,
    CompleteActivitySchema,
    CreateActivityFromTemplateSchema,
    CreateActivityParticipantSchema,
    CreateActivitySchema,
    CreateActivityTemplateSchema,
    ParticipantRoleSchema,
    ParticipantStatusSchema,
    UpdateActivityParticipantSchema,
    UpdateActivitySchema,
    UpdateActivityStatusSchema,
    UpdateActivityTemplateSchema
} from '../validators/activity'

import { User } from "./user";
import { Contact } from "./contact";
import { Company } from "./company";
import { Customer } from "./customer";
import { Opportunity } from "./opportunity";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Type Activity
 */
export type Activity = z.infer<typeof CreateActivitySchema> & {
  id: number; 
  company?: Company; 
  customer?: Customer;
  contact?: Contact;
  opportunity?: Opportunity; 
  assignedUser: User;
  createdBy: User;
  partecipants?: ActivityPartecipant[];
  followUpActivity: Activity;
  followedUpBy: Activity[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type ActivityPartecipant
 */
export type ActivityPartecipant = z.infer<typeof CreateActivityParticipantSchema> & {
  id: number;

  // Relazioni
  activity?: Activity[];
  user?: User[];
  contact?: Contact[];

  responseDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type ActivityTemplate
 */
export type ActivityTemplate = z.infer<typeof CreateActivityTemplateSchema> & {
  id: number;

  createdAt: Date;
  updatedAt: Date;
}

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
}

export type ActivityType = z.infer<typeof ActivityTypeSchema>
export type ActivityStatus = z.infer<typeof ActivityStatusSchema>
export type ActivityPriority = z.infer<typeof ActivityPrioritySchema>
export type ActivityOutcome = z.infer<typeof ActivityOutcomeSchema>
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>
export type ParticipantRole = z.infer<typeof ParticipantRoleSchema>

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>
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