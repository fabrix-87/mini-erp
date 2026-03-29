// components/leads/lead-source-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { LeadSource } from "@mini-erp/shared/constants";

// ============================================================================
// Config
// ============================================================================

const SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL_MEDIA: "Social Media",
  EMAIL_CAMPAIGN: "Email Campaign",
  PHONE_CALL: "Telefono",
  COLD_CALL: "Cold Call",
  EVENT: "Evento",
  PARTNER: "Partner",
  ADVERTISING: "Pubblicità",
  CONTENT: "Contenuto",
  DIRECT: "Diretto",
  CHAT: "Chat",
  OTHER: "Altro",
};

// ============================================================================
// Component
// ============================================================================

interface LeadSourceBadgeProps {
  source: LeadSource;
}

/**
 * Displays a neutral outline badge for lead source.
 */
export function LeadSourceBadge({ source }: LeadSourceBadgeProps) {
  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      {SOURCE_LABELS[source] ?? source}
    </Badge>
  );
}

export function getLeadSourceLabel(source: LeadSource): string {
  return SOURCE_LABELS[source] ?? source;
}
