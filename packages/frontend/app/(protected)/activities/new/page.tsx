// app/activities/new/page.tsx
import { ActivityForm } from "@/components/activity/activity-form";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/server/auth";
import { getLeadByIdServer } from "@/services/server/lead-service";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface SearchParams {
  customerId?: string;
  contactId?: string;
  leadId?: string;
  date?: string;
}

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requirePermission("activity:create");

  const params = await searchParams;
  const t = await getTranslations("activities");

  return (
    <>
      <PageHeader title={t("createTitle")} subtitle={t("createDescription")} />
      <ActivityForm
        preselectedCustomerId={params.customerId}
        preselectedContactId={params.contactId}
        preselectedLeadId={params.leadId}
        preselectedDate={params.date}
      />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("activities");
  return {
    title: `${t("createTitle")} | ${process.env.APP_NAME}`,
    description: t("createDescription"),
  };
}
