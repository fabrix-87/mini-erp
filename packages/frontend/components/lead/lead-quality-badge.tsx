// components/leads/lead-quality-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { LeadQuality } from "@mini-erp/shared/constants";

// ============================================================================
// Config
// ============================================================================

const QUALITY_CONFIG: Record<LeadQuality, { label: string; emoji: string; className: string }> = {
  HOT: {
    label: "Hot",
    emoji: "🔥",
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
  WARM: {
    label: "Warm",
    emoji: "♨️",
    className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  },
  COLD: {
    label: "Cold",
    emoji: "❄️",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  },
};

// ============================================================================
// Component
// ============================================================================

interface LeadQualityBadgeProps {
  quality: LeadQuality;
  /** Show emoji alongside label. @default true */
  showEmoji?: boolean;
}

/**
 * Displays a colored badge for lead quality (HOT / WARM / COLD).
 */
export function LeadQualityBadge({ quality, showEmoji = true }: LeadQualityBadgeProps) {
  const config = QUALITY_CONFIG[quality] ?? { label: quality, emoji: "", className: "" };

  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {showEmoji && <span className="mr-1">{config.emoji}</span>}
      {config.label}
    </Badge>
  );
}

export function getLeadQualityLabel(quality: LeadQuality): string {
  return QUALITY_CONFIG[quality]?.label ?? quality;
}
