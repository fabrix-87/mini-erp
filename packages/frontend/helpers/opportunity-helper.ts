import { OpportunitySource, OpportunityStatus, SalesStage } from "@mini-erp/shared";

import { useTranslations } from "next-intl";

type T = ReturnType<typeof useTranslations<"crm.opportunities">>;

export type FilterStatus = OpportunityStatus | "ALL";
export type FilterStage = SalesStage | "ALL";
export type FilterSource = OpportunitySource | "ALL";

export function getOpportunityStatusOptions(t: T, includeAll = false) {
  const keys: FilterStatus[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "OPEN",
    "WON",
    "CLOSED",
    "PENDING",
    "LOST",
  ];
  return keys.map((value) => ({ value, label: t(`status.${value.toLowerCase()}`) }));
}

export function getOpportunityStageOptions(t: T, includeAll = false) {
  const keys: FilterStage[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "LEAD_QUALIFICATION",
    "PROSPECTING",
    "NEEDS_ANALYSIS",
    "PROPOSAL_SENT",
    "NEGOTIATION",
    "COMMITMENT",
  ];
  return keys.map((value) => ({ value, label: t(`stage.${value.toLowerCase()}`) }));
}

export function getOpportunitySourceOptions(t: T, includeAll = false) {
  const keys: FilterSource[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "CUSTOMER",
    "EVENT",
    "INBOUND",
    "LEAD",
    "OTHER",
    "OUTBOUND",
    "PARTNER",
    "REFERRAL",
  ];
  return keys.map((value) => ({ value, label: t(`source.${value.toLowerCase()}`) }));
}

// ============================================================================
// STAGE COLORS — Kanban board visual differentiation
// ============================================================================

/**
 * Tailwind color tokens for a kanban stage column.
 * Progresses from neutral (early stage) to warm/green (late stage, pre-close).
 */
export interface StageColorTokens {
  /** Top border accent color for the column */
  accent: string;
  /** Background tint for the column header */
  headerBg: string;
  /** Background tint for the column body */
  columnBg: string;
  /** Dot/badge indicator color */
  dot: string;
}

const STAGE_COLORS: Record<SalesStage, StageColorTokens> = {
  LEAD_QUALIFICATION: {
    accent: "border-t-slate-400",
    headerBg: "bg-slate-50 dark:bg-slate-900/40",
    columnBg: "bg-slate-50/50 dark:bg-slate-950/20",
    dot: "bg-slate-400",
  },
  PROSPECTING: {
    accent: "border-t-blue-400",
    headerBg: "bg-blue-50 dark:bg-blue-950/40",
    columnBg: "bg-blue-50/40 dark:bg-blue-950/20",
    dot: "bg-blue-400",
  },
  NEEDS_ANALYSIS: {
    accent: "border-t-indigo-400",
    headerBg: "bg-indigo-50 dark:bg-indigo-950/40",
    columnBg: "bg-indigo-50/40 dark:bg-indigo-950/20",
    dot: "bg-indigo-400",
  },
  PROPOSAL_SENT: {
    accent: "border-t-violet-400",
    headerBg: "bg-violet-50 dark:bg-violet-950/40",
    columnBg: "bg-violet-50/40 dark:bg-violet-950/20",
    dot: "bg-violet-400",
  },
  NEGOTIATION: {
    accent: "border-t-amber-400",
    headerBg: "bg-amber-50 dark:bg-amber-950/40",
    columnBg: "bg-amber-50/40 dark:bg-amber-950/20",
    dot: "bg-amber-400",
  },
  COMMITMENT: {
    accent: "border-t-emerald-400",
    headerBg: "bg-emerald-50 dark:bg-emerald-950/40",
    columnBg: "bg-emerald-50/40 dark:bg-emerald-950/20",
    dot: "bg-emerald-400",
  },
};

/**
 * Returns the Tailwind color tokens for a given sales stage,
 * used to visually differentiate kanban columns by pipeline progression.
 * @param stage - The sales stage enum value
 */
export function getStageColorTokens(stage: SalesStage): StageColorTokens {
  return STAGE_COLORS[stage];
}
