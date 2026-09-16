// ============================================================================
// Helper
// ============================================================================

import {
  DecisionAuthority,
  LeadQuality,
  LeadSource,
  LeadStatus,
  PurchaseTimeframe,
} from "@mini-erp/shared";
import { useTranslations } from "next-intl";

export type FilterStatus = LeadStatus | "ALL";
export type FilterSource = LeadSource | "ALL";
export type FilterQuality = LeadQuality | "ALL";

export function getStatusOptions(t: ReturnType<typeof useTranslations<"crm.leads">>) {
  const keys: FilterStatus[] = [
    "ALL",
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "UNQUALIFIED",
    "NURTURING",
    "CONVERTED",
    "LOST",
    "DUPLICATE",
    "ARCHIVED",
  ];
  return keys.map((value) => ({ value, label: t(`status.${value}`) }));
}

export function getSourceOptions(t: ReturnType<typeof useTranslations<"crm.leads">>) {
  const keys: FilterSource[] = [
    "ALL",
    "WEBSITE",
    "REFERRAL",
    "SOCIAL_MEDIA",
    "EMAIL_CAMPAIGN",
    "PHONE_CALL",
    "COLD_CALL",
    "EVENT",
    "PARTNER",
    "ADVERTISING",
    "CONTENT",
    "DIRECT",
    "CHAT",
    "OTHER",
  ];
  return keys.map((value) => ({ value, label: t(`source.${value}`) }));
}

export function getQualityOptions(t: ReturnType<typeof useTranslations<"crm.leads">>) {
  const keys: FilterQuality[] = ["ALL", "HOT", "WARM", "COLD"];
  return keys.map((value) => ({ value, label: t(`quality.${value}`) }));
}

export function getPurchaseTimeframeOptions(t: ReturnType<typeof useTranslations<"crm.leads">>) {
  const keys: PurchaseTimeframe[] = [
    "IMMEDIATE",
    "SHORT_TERM",
    "MEDIUM_TERM",
    "LONG_TERM",
    "UNDEFINED",
  ];
  return keys.map((value) => ({ value, label: t(`purchaseTimeframe.${value}`) }));
}

export function getDecisionAuthorityOptions(t: ReturnType<typeof useTranslations<"crm.leads">>) {
  const keys: DecisionAuthority[] = [
    "DECISION_MAKER",
    "INFLUENCER",
    "GATEKEEPER",
    "END_USER",
    "UNKNOWN",
  ];
  return keys.map((value) => ({ value, label: t(`decisionAuthority.${value}`) }));
}

export const LEAD_STATUS_CLASS_NAMES: Record<LeadStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  CONTACTED: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  QUALIFIED: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  UNQUALIFIED: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
  NURTURING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  CONVERTED: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  LOST: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  DUPLICATE: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  ARCHIVED: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20",
};

export const LEAD_QUALITY_CLASS_NAMES: Record<LeadQuality, string> = {
  HOT: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  WARM: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  COLD: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
};

export const LEAD_SOURCE_CLASS_NAME: Record<LeadSource, string> = {
  OTHER: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
  WEBSITE: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  REFERRAL: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  SOCIAL_MEDIA: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  EMAIL_CAMPAIGN: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  PHONE_CALL: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  COLD_CALL: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  EVENT: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  PARTNER: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  ADVERTISING: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  CONTENT: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  DIRECT: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20",
  CHAT: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
};
