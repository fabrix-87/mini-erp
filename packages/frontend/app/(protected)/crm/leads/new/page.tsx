import { LeadForm } from "@/components/lead/lead-form";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/server/auth";
import { getTranslations } from "next-intl/server";

/**
 * New lead creation page — Server Component wrapper.
 */
export default async function NewLeadPage() {
  await requirePermission("lead:create");

  const t = await getTranslations("crm.leads");

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[{ label: t("leadNewTitle") }]}
        title={t("leadNewTitle")}
        subtitle={t("leadNewDescription")}
      />
      <LeadForm mode="create" />
    </>
  );
}

// Metadata
export async function generateMetadata() {
  const t = await getTranslations("crm.leads");

  return {
    title: `${t("leadNewTitle")} | ${process.env.APP_NAME}`,
    description: t("leadNewDescription"),
  };
}
