import {
  ACTIVITY_OUTCOME,
  ACTIVITY_PRIORITY,
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  ActivityOutcome,
  ActivityPriority,
  ActivityStatus,
  ActivityType,
} from "@mini-erp/shared";
import { useTranslations } from "next-intl";

type T = ReturnType<typeof useTranslations<"activities">>;
type TypeFilter = ActivityType | "ALL";
type PriorityFilter = ActivityPriority | "ALL";
type StatusFilter = ActivityStatus | "ALL";
type OutcomeFilter = ActivityOutcome | "ALL";

export function getActivityTypeOptions(t: T, includeAll = false) {
  const keys: TypeFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(ACTIVITY_TYPE),
  ];
  return keys.map((value) => ({ value, label: t(`type.${value}`) }));
}

export function getActivityPriorityOptions(t: T, includeAll = false) {
  const keys: PriorityFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(ACTIVITY_PRIORITY),
  ];
  return keys.map((value) => ({ value, label: t(`priority.${value}`) }));
}

export function getActivityStatusOptions(t: T, includeAll = false) {
  const keys: StatusFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(ACTIVITY_STATUS),
  ];
  return keys.map((value) => ({ value, label: t(`status.${value}`) }));
}

export function getActivityOutcomeOptions(t: T, includeAll = false) {
  const keys: OutcomeFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(ACTIVITY_OUTCOME),
  ];
  return keys.map((value) => ({ value, label: t(`outcome.${value}`) }));
}
