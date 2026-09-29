import { ActivityOutcome, ActivityPriority, ActivityStatus, ActivityType } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

type T = ReturnType<typeof useTranslations<"activities">>;
type TypeFilter = ActivityType | "ALL";
type PriorityFilter = ActivityPriority | "ALL";
type StatusFilter = ActivityStatus | "ALL";
type OutcomeFilter = ActivityOutcome | "ALL";

export function getActivityTypeOptions(t: T, includeAll = false) {
  const keys: TypeFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "CALL",
    "EMAIL",
    "MEETING",
    "NOTE",
    "OTHER",
    "SITE_VISIT",
    "SMS",
    "TASK",
    "VIDEO_CALL",
    "WHATSAPP",
  ];
  return keys.map((value) => ({ value, label: t(`type.${value}`) }));
}

export function getActivityPriorityOptions(t: T, includeAll = false) {
  const keys: PriorityFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "HIGH",
    "LOW",
    "MEDIUM",
    "URGENT",
  ];
  return keys.map((value) => ({ value, label: t(`priority.${value}`) }));
}

export function getActivityStatusOptions(t: T, includeAll = false) {
  const keys: StatusFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "CANCELLED",
    "COMPLETED",
    "IN_PROGRESS",
    "NO_SHOW",
    "RESCHEDULED",
    "SCHEDULED"
  ];
  return keys.map((value) => ({ value, label: t(`status.${value}`) }));
}

export function getActivityOutcomeOptions(t: T, includeAll = false) {
  const keys: OutcomeFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "CALLBACK_LATER",
    "FOLLOW_UP_NEEDED",
    "LEFT_MESSAGE",
    "NOT_INTERESTED",
    "NO_ANSWER",
    "OTHER",
    "POSTPONED",
    "SUCCESSFUL",
    "WRONG_CONTACT"
  ];
  return keys.map((value) => ({ value, label: t(`outcome.${value}`) }));
}

export const ACTIVITY_STATUS_CLASS_NAMES = {
  COMPLETED: "bg-green-500/5 border-green-500/20",
  IN_PROGRESS: "bg-blue-500/5 border-blue-500/20",
  CANCELLED: "bg-red-500/5 border-red-500/20",
  SCHEDULED: "bg-yellow-500/5 border-yellow-500/20",
  NO_SHOW: "bg-slate-500/5 border-slate-500/20",
  RESCHEDULED: "bg-violet-500/5 border-violet-500/20",
} satisfies Record<ActivityStatus, string>;

export const ACTIVITY_PRIORITY_VARIANTS = {
  HIGH: "destructive",
  LOW: "secondary",
  MEDIUM: "secondary",
  URGENT: "destructive",
} satisfies Record<ActivityPriority, "destructive" | "secondary">;