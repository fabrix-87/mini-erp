// components/leads/lead-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@mini-erp/shared/constants";

// ============================================================================
// Config
// ============================================================================

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  NEW: {
    label: "Nuovo",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  CONTACTED: {
    label: "Contattato",
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  QUALIFIED: {
    label: "Qualificato",
    className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  },
  UNQUALIFIED: {
    label: "Non qualif.",
    className: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
  },
  NURTURING: {
    label: "Nurturing",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  CONVERTED: {
    label: "Convertito",
    className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  LOST: {
    label: "Perso",
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
  DUPLICATE: {
    label: "Duplicato",
    className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  },
  ARCHIVED: {
    label: "Archiviato",
    className: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20",
  },
};

// ============================================================================
// Component
// ============================================================================

interface LeadStatusBadgeProps {
  status: LeadStatus;
  /** @default "sm" */
  size?: "sm" | "md";
}

/**
 * Displays a colored badge for a lead status value.
 */
export function LeadStatusBadge({ status, size = "sm" }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "" };

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${size === "md" ? "text-sm px-2.5 py-0.5" : "text-xs"}`}
    >
      {config.label}
    </Badge>
  );
}

/** Returns only the label string for a given status */
export function getLeadStatusLabel(status: LeadStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}
