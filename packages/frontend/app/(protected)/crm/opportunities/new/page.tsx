import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/server/auth";
import { getTranslations } from "next-intl/server";
import { OpportunityForm } from "../components/opportunity-form";

export default async function newOpportunity() {
  await requirePermission("opportunity:create");
  const t = await getTranslations("crm.opportunities");

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[{ label: t("opportunityNewTitle") }]}
        title={t("opportunityNewTitle")}
        subtitle={t("opportunityNewDescription")}
      />
      <OpportunityForm mode="create"/>
    </>
  );
}

// Metadata
export async function generateMetadata() {
  const t = await getTranslations("crm.opportunities");

  return {
    title: `${t("opportunityNewTitle")} | ${process.env.APP_NAME}`,
    description: t("opportunityNewDescription"),
  };
}
