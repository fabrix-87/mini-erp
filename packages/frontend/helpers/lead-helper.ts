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
