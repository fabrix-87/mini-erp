// app/(protected)/crm/opportunities/[id]/components/opportunity-detail-activities.tsx
import type { Activity } from "@mini-erp/shared";
import { ActivityList } from "@/components/activity/activity-list";

interface Props {
  opportunityId: string;
  activities: Activity[];
}

/**
 * Activities tab for the opportunity detail page.
 */
export function OpportunityDetailActivities({ opportunityId, activities }: Props) {
  return <ActivityList opportunityId={opportunityId} activities={activities} />;
}
