// app/(protected)/crm/opportunities/[id]/components/opportunity-detail-activities.tsx
import type { Activity } from "@mini-erp/shared";
import { LeadActivityList } from "@/components/lead/lead-activity-list";

interface Props {
  opportunityId: string;
  activities: Activity[];
}

/**
 * Activities tab for the opportunity detail page.
 * Reuses LeadActivityList — verify it accepts a generic entityId prop,
 * otherwise create OpportunityActivityList as a thin wrapper.
 */
export function OpportunityDetailActivities({ opportunityId, activities }: Props) {
  return <LeadActivityList leadId={opportunityId} activities={activities} />;
}
