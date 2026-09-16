// components/leads/lead-quality-badge.tsx
import { Badge } from "@/components/ui/badge";
import { LEAD_QUALITY_CLASS_NAMES } from "@/helpers/lead-helper";
import type { LeadQuality } from "@mini-erp/shared/constants";

// ============================================================================
// Component
// ============================================================================

interface LeadQualityBadgeProps {
  quality: LeadQuality;
  label?: string;
  /** Show emoji alongside label. @default true */
  showEmoji?: boolean;
}

/**
 * Displays a colored badge for lead quality (HOT / WARM / COLD).
 */
export function LeadQualityBadge({ quality, label = quality }: LeadQualityBadgeProps) {
  return (
    <Badge variant="outline" className={`text-xs ${LEAD_QUALITY_CLASS_NAMES[quality]}`}>
      {label}
    </Badge>
  );
}
