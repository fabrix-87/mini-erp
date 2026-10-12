// app/activities/page.tsx
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
import { ActivityListPage } from "./components/activity-list-page";
import { notFound } from "next/navigation";

const DEFAULT_DATE_RANGE = 14;

export default async function ActivitiesPage({
  searchParams,
}: SearchParamsProps<ActivityQueryInput>) {
  await requirePermission("activity:read");

  const t = await getTranslations("activities");
  const params = await searchParams;
  const parsedParams: ActivityQueryInput = activityQuerySchema.parse(params);

  const now = new Date();

  const defaultStartDate = new Date(now);
  defaultStartDate.setDate(now.getDate() - DEFAULT_DATE_RANGE / 2);
  defaultStartDate.setHours(0, 0, 0, 0);

  const defaultEndDate = new Date(now);
  defaultEndDate.setDate(now.getDate() + DEFAULT_DATE_RANGE / 2);
  defaultEndDate.setHours(23, 59, 59, 999);

  const queryParams = {
    ...parsedParams,
    startDate: parsedParams.startDate ?? defaultStartDate.toISOString(),
    endDate: parsedParams.endDate ?? defaultEndDate.toISOString(),
  };

  const [result, stats, permissions] = await Promise.all([
    fetchActivitiesServer(queryParams),
    fetchActivityStatsServer(),
    checkEntityPermissions("activity"),
  ]);

  const actionItems: PageHeaderAction[] = [
    createCreateAction(
      "create",
      t("createNew") ?? "Nuova",
      getNewRoute("activities"),
      permissions.canCreate,
    ),
  ];

  if (!result.success || !result.data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("description")} actionItems={actionItems} />
      {/* Stats Grid */}
      <ActivityStatsGrid stats={stats.data} />

      {/* Lista Attività con Filtri */}
      <ActivityListPage
        activities={result.data.data}
        pagination={result.data.pagination}
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
