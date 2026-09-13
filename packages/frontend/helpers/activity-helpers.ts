import { ActivityPriority, ActivityType } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

type T = ReturnType<typeof useTranslations<"activities">>;
type TypeFilter = ActivityType | "ALL";
type PriorityFilter = ActivityPriority | "ALL";

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
