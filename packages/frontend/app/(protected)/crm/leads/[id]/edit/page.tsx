// app/leads/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/lead/lead-form";
import { getLeadByIdServer } from "@/services/server/lead-service";
import { PageIdProps } from "@/types/page-types";
import { requirePermission } from "@/lib/server/auth";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { getDetailRoute } from "@/lib/navigation-routes";
import { daysSince, formatDateIT } from "@/helpers/date-helper";

/**
 * Lead edit page — Server Component.
 * Fetches current lead data server-side and passes it to LeadForm in edit mode.
 */
export default async function EditLeadPage({ params }: PageIdProps) {
  await requirePermission("lead:update");
  const t = await getTranslations("crm.leads");

  const { id } = await params;

  const response = await getLeadByIdServer(id);
  if (!response?.data) notFound();

  const lead = response.data;

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[
          { label: lead.companyName, href: getDetailRoute("leads", id) },
          { label: t("leadEditTitle") },
        ]}
        title={lead.companyName}
        subtitle={t("leadDetailSubtitle",{
          code: lead.code,
          createdAt: formatDateIT(lead.createdAt),
          daysSince: daysSince(lead.createdAt)
        })}
      />

      <LeadForm mode="edit" lead={lead} />
    </>
  );
}

// Metadata
export async function generateMetadata() {
  const t = await getTranslations("crm.leads");

  return {
    title: `${t("leadEditTitle")} | ${process.env.APP_NAME}`,
    description: t("leadEditDescription"),
  };
}
