import { PageHeader } from "@/components/page-header";
import { getDetailRoute } from "@/lib/navigation-routes";
import { requirePermission } from "@/lib/server/auth";
import { getOpportunityById } from "@/services/server/opportunity-service";
import { PageIdProps } from "@/types/page-types";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { OpportunityForm } from "../../components/opportunity-form";

export default async function EditOpportunityPage({ params }: PageIdProps) {
  await requirePermission("opportunity:update");

  const { id } = await params;
  const result = await getOpportunityById(id, 3600);
  const t = await getTranslations("crm.opportunities");

  if (!result) notFound();

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[
          { label: result.title, href: getDetailRoute("opportunity", id) },
          { label: t("opportunityEditTitle") },
        ]}
        title={`${t("opportunityEditTitle")}: ${result.title}`}
        subtitle={t("opportunityEditDescription")}
      />
      <OpportunityForm mode="edit" opportunity={result} />
    </>
  );
}

// Metadata
export async function generateMetadata({ params }: PageIdProps) {
  const t = await getTranslations("crm.opportunities");
  try {
    const { id } = await params;

    const opportunity = await getOpportunityById(id, 3600);

    return {
      title: `${opportunity.title} - ${t("opportunityEditTitle")} | ${process.env.APP_NAME}`,
      description: `${t("opportunityEditDescription")}`,
    };
  } catch {
    return {
      title: `${t("opportunityEditTitle")} | ${process.env.APP_NAME}`,
    };
  }
}
