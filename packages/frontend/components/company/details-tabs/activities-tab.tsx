// components/company/details-tabs/activities-tab.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getActivities } from "@/services/client/activity";
import { PageSkeleton } from "@/components/page-skeleton";
import { ActivityList } from "@/components/activity/activity-list";

interface CompanyActivitiesTabProps {
  customerId?: string;
  supplierId?: string;
}

export function CompanyActivitiesTab({ customerId, supplierId }: CompanyActivitiesTabProps) {
  if ((customerId === supplierId) === undefined) {
    return <div>Errore: customerId e supplierId non possono essere entrambi indefiniti</div>;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["activities", { customerId, supplierId }],
    queryFn: () =>
      getActivities({
        customerId,
        supplierId,
        page: 1,
        limit: 20,
        sortBy: "scheduledStart",
        sortOrder: "asc",
      }),
  });

  const activities = data?.data || [];

  if (isLoading) {
    return <PageSkeleton variant="table" />;
  }

  return <ActivityList activities={activities} customerId={customerId} supplierId={supplierId} />;
}
