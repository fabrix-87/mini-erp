// app/activities/activity-list-client.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Activity, ActivityQueryInput } from "@/types/activitiy-types";
import { ActivityCard } from "@/components/activity/activity-card";
import { useNavigation } from "@/hooks/use-navigation";
import { EntityPermissions, PaginationInfo } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { DataPagination } from "@/components/data-pagination";

interface ActivityListPageProps {
  activities: Activity[];
  pagination: PaginationInfo;
  searchParams: ActivityQueryInput;
  permissions: EntityPermissions;
}

export function ActivityListPage({
  activities,
  pagination,
  searchParams,
  permissions,
}: ActivityListPageProps) {
  const { navigateToDetail } = useNavigation();
  const t = useTranslations("activities");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("activityList")}</h2>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{t("noResults")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              className="bg-card"
              activity={activity}
              onClick={() => navigateToDetail("activities", activity.id)}
            />
          ))}
        </div>
      )}
      {pagination && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.itemsPerPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemLabel={t("itemLabel")}
        />
      )}
    </div>
  );
}
