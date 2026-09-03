import { OpportunitySource, OpportunityStatus, SalesStage } from "@mini-erp/shared";

import { useTranslations } from "next-intl";

export type FilterStatus = OpportunityStatus | "ALL";
export type FilterStage = SalesStage | "ALL";
export type FilterSource = OpportunitySource | "ALL";

export function getStatusOptions(t: ReturnType<typeof useTranslations<"crm.opportunities">>) {
  const keys: FilterStatus[] = [
    "ALL",
    "OPEN",
    "WON",
    "CLOSED",
    "PENDING",
    "LOST",
  ];
  return keys.map((value) => ({ value, label: t(`status.${value.toLowerCase()}`) }));
}

export function getStageOptions(t: ReturnType<typeof useTranslations<"crm.opportunities">>) {
  const keys: FilterStage[] = [
    "ALL",
    "LEAD_QUALIFICATION",
    "PROSPECTING",
    "NEEDS_ANALYSIS",
    "PROPOSAL_SENT",
    "NEGOTIATION",
    "COMMITMENT",
  ];
  return keys.map((value) => ({ value, label: t(`stage.${value.toLowerCase()}`) }));
}

export function getSourceOptions(t: ReturnType<typeof useTranslations<"crm.opportunities">>) {
  const keys: FilterSource[] = [
    "ALL",
    "CUSTOMER",
    "EVENT",
    "INBOUND",
    "LEAD",
    "OTHER",
    "OUTBOUND",
    "PARTNER",
    "REFERRAL"
  ];
  return keys.map((value) => ({ value, label: t(`source.${value.toLowerCase()}`) }));
}
