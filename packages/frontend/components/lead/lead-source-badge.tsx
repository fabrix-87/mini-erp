// components/leads/lead-source-badge.tsx
import { Badge } from "@/components/ui/badge";
import { LEAD_SOURCE_CLASS_NAME } from "@/helpers/lead-helper";
import type { LeadSource } from "@mini-erp/shared/constants";

// ============================================================================
// Component
// ============================================================================

interface LeadSourceBadgeProps {
  source: LeadSource;
  label?: string;
}

/**
 * Displays a neutral outline badge for lead source.
 */
export function LeadSourceBadge({ source, label = source }: LeadSourceBadgeProps) {
  return (
    <Badge variant="outline" className={`text-xs ${LEAD_SOURCE_CLASS_NAME[source]}`}>
      {label}
    </Badge>
  );
}
