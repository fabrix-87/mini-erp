import { OpportunitySource, OpportunityStatus, SalesStage } from "@mini-erp/shared";

import { useTranslations } from "next-intl";

type T = ReturnType<typeof useTranslations<"crm.opportunities">>;

export type FilterStatus = OpportunityStatus | "ALL";
export type FilterStage = SalesStage | "ALL";
export type FilterSource = OpportunitySource | "ALL";

export function getStatusOptions(t: T) {
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

export function getStageOptions(t: T) {
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

export function getSourceOptions(t: T) {
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

/** Status options for selects (esclude ALL) */
export function getOpportunityStatusOptions(t: T) {
  return (["OPEN", "WON", "LOST", "PENDING", "CLOSED"] as const).map((v) => ({
    value: v,
    label: t(`status.${v.toLowerCase() as Lowercase<typeof v>}`),
  }));
}

/** Stage options for selects */
export function getOpportunityStageOptions(t: T) {
  return ([
    "LEAD_QUALIFICATION", "PROSPECTING", "NEEDS_ANALYSIS",
    "PROPOSAL_SENT", "NEGOTIATION", "COMMITMENT",
  ] as const).map((v) => ({
    value: v,
    label: t(`stage.${v.toLowerCase() as Lowercase<typeof v>}`),
  }));
}

/** Source options for selects (esclude ALL) */
export function getOpportunitySourceOptions(t: T) {
  return (["LEAD", "CUSTOMER", "INBOUND", "OUTBOUND", "REFERRAL", "PARTNER", "EVENT", "OTHER"] as const).map(
    (v) => ({
      value: v,
      label: t(`source.${v.toLowerCase() as Lowercase<typeof v>}`),
    }),
  );
}