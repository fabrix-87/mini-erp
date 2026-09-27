// app/activities/page.tsx
import { Suspense } from "react";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { ActivityQueryInput, activityQuerySchema } from "@mini-erp/shared";
import { PageHeaderAction, SearchParamsProps } from "@/types/page-types";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";
import { getNewRoute } from "@/lib/navigation-routes";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import {
  fetchActivitiesServer,
  fetchActivityStatsServer,
} from "@/services/server/activity-service";
import { ActivityStatsGrid } from "@/components/activity/activity-stats-grid";
import { ActivityListPage } from "./activity-list-page";

export default async function ActivitiesPage({
  searchParams,
}: SearchParamsProps<ActivityQueryInput>) {
  await requirePermission("activity:read");

  const t = await getTranslations("activities");
  const params = await searchParams;
  const queryParams: ActivityQueryInput = activityQuerySchema.parse(params);

  const [result, stats, permissions] = await Promise.all([
    fetchActivitiesServer(queryParams),
    fetchActivityStatsServer(),
    checkEntityPermissions("activity"),
  ]);

  console.log(result)

  const actionItems: PageHeaderAction[] = [
    createCreateAction(
      "create",
      t("createNew") ?? "Nuova",
      getNewRoute("activities"),
      permissions.canCreate,
    ),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("description")} actionItems={actionItems} />
      {/* Stats Grid */}
      <ActivityStatsGrid stats={stats.data} />

      {/* Lista Attività con Filtri */}
      <ActivityListPage
        activities={result.data}
        pagination={result.pagination}
        permissions={permissions}
        searchParams={queryParams}
      />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("activities");
  return {
    title: `${t("title")} | ${process.env.APP_NAME}`,
    description: t("description"),
  };
}
