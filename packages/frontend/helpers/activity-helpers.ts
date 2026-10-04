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
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
  ];
  return keys.map((value) => ({ value, label: t(`priority.${value}`) }));
}

export function getActivityStatusOptions(t: T, includeAll = false) {
  const keys: StatusFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "CANCELLED",
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
