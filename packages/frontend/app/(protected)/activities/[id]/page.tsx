// app/activities/[id]/page.tsx
import { notFound } from "next/navigation";
import { fetchActivityByIdServer } from "@/services/server/activity-service";
import { ActivityDetailClient } from "@/components/activity/activity-detail-client";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { PageHeaderAction, PageIdProps } from "@/types/page-types";
import { PageHeader } from "@/components/page-header";
import { createDeleteServerAction, createEditAction } from "@/helpers/page-header-actions-helper";
import { getTranslations } from "next-intl/server";
import { getEditRoute } from "@/lib/navigation-routes";
import { deleteActivityAction } from "@/actions/activity-actions";
import { formatDateIT } from "@/helpers/date-helper";

export default async function ActivityDetailPage({ params }: PageIdProps) {
  await requirePermission("activity:read");

  const { id } = await params;
  const [activity, permissions] = await Promise.all([
    fetchActivityByIdServer(id, 3600),
    checkEntityPermissions("activity"),
  ]);
  const t = await getTranslations("activities");
  const tc = await getTranslations("common");

  const deleteAction = deleteActivityAction.bind(null, id);

  const actionItems: PageHeaderAction[] = [
    createEditAction(
      "edit",
      tc("actions.edit"),
      getEditRoute("activities", id),
      permissions.canUpdate,
    ),
    createDeleteServerAction("delete", tc("actions.delete"), deleteAction, {
      title: tc("deleteDialog.title", { name: activity.subject }),
      description: tc("deleteDialog.description"),
    }),
  ];

  return (
    <>
      <PageHeader
        title={activity.subject}
        subtitle={t("detailDescription", {
          date: formatDateIT(activity.scheduledStart),
          duration: activity.duration ? t(`duration.${activity.duration}`) : "-",
        })}
        actionItems={actionItems}
      />
      <ActivityDetailClient activity={activity} />
    </>
  );
}

// Metadata
export async function generateMetadata({ params }: PageIdProps) {
  const { id } = await params;

  const result = await fetchActivityByIdServer(id, 3600);

  return {
    title: `${result.subject} | ${process.env.APP_NAME}`,
  };
}
