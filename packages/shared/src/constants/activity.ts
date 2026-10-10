import { z } from "zod";
import { activitySortFieldsSchema, activityStatusSchema, activityTypeSchema } from "../validators";

export type ActivityStatus = z.infer<typeof activityStatusSchema>;
export type ActivityType = z.infer<typeof activityTypeSchema>;
export type ActivirySortFields = z.input<typeof activitySortFieldsSchema>;

export const ACTIVITY_TYPE = {
  CALL: "CALL",
  EMAIL: "EMAIL",
  MEETING: "MEETING",
  TASK: "TASK",
  NOTE: "NOTE",
  WHATSAPP: "WHATSAPP",
  SMS: "SMS",
  VIDEO_CALL: "VIDEO_CALL",
  SITE_VISIT: "SITE_VISIT",
  OTHER: "OTHER",
} as const;

export const ACTIVITY_STATUS = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  RESCHEDULED: "RESCHEDULED",
  NO_SHOW: "NO_SHOW",
} as const;

export const ACTIVITY_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export const ACTIVITY_OUTCOME = {
  OTHER: "OTHER",
  SUCCESSFUL: "SUCCESSFUL",
  NO_ANSWER: "NO_ANSWER",
  LEFT_MESSAGE: "LEFT_MESSAGE",
  FOLLOW_UP_NEEDED: "FOLLOW_UP_NEEDED",
  NOT_INTERESTED: "NOT_INTERESTED",
  WRONG_CONTACT: "WRONG_CONTACT",
  CALLBACK_LATER: "CALLBACK_LATER",
  POSTPONED: "POSTPONED",
} as const;

export const ACTIVITY_PARTECIPANT_STATUS = {
  NO_SHOW: "NO_SHOW",
  INVITED: "INVITED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  TENTATIVE: "TENTATIVE",
  ATTENDED: "ATTENDED",
} as const;

export const ACTIVITY_SORT_FIELDS = ["scheduledStart", "priority"];

export const ACTIVITY_PARTECIPANT_ROLE = {
  ORGANIZER: "ORGANIZER",
  REQUIRED: "REQUIRED",
  OPTIONAL: "OPTIONAL",
} as const;
