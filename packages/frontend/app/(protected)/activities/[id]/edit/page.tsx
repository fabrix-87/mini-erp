// app/activities/[id]/edit/page.tsx
import { fetchActivityByIdServer } from "@/services/server/activity-service";
import { ActivityForm } from "@/components/activity/activity-form";
import { getCurrentUser, requirePermission } from "@/lib/server/auth";
import { PageIdProps } from "@/types/page-types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";

export default async function EditActivityPage({ params }: PageIdProps) {
  const { id } = await params;

  await requirePermission("activity:update");

  const activity = await fetchActivityByIdServer(id);
  const { id: userId } = await getCurrentUser();
  const t = await getTranslations("activities");

  return (
    <>
      <PageHeader title={t("updateTitle")} subtitle={t("updateDescription")} />
      <ActivityForm userId={userId} activity={activity} isEditMode={true} />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("activities");
  return {
    title: `${t("updateTitle")} | ${process.env.APP_NAME}`,
    description: t("updateDescription"),
  };
}
