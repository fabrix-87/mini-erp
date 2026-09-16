// components/leads/lead-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_CLASS_NAMES } from "@/helpers/lead-helper";
import type { LeadStatus } from "@mini-erp/shared/constants";

// ============================================================================
// Component
// ============================================================================

interface LeadStatusBadgeProps {
  status: LeadStatus;
  label?: string;
  /** @default "sm" */
  size?: "sm" | "md";
}

/**
 * Displays a colored badge for a lead status value.
 */
export function LeadStatusBadge({ status, label = status, size = "sm" }: LeadStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${LEAD_STATUS_CLASS_NAMES[status]} ${size === "md" ? "text-sm px-2.5 py-0.5" : "text-xs"}`}
    >
      {label}
    </Badge>
  );
}
