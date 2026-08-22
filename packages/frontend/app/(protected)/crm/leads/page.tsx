import { LeadListPage } from "./components/lead-list-page";
import { LeadQueryInput, leadQuerySchema } from "@mini-erp/shared";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllLeads, getLeadStatsServer } from "@/services/server/lead-service";
import { getTranslations } from "next-intl/server";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";

// ============================================================================
// Page — Server Component
// ============================================================================

interface LeadsPageProps {
  searchParams: Promise<LeadQueryInput>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  await requirePermission("lead:read");

  const params: LeadQueryInput = leadQuerySchema.parse(await searchParams);

  const [result, stats, permissions] = await Promise.all([
    getAllLeads(params, 3600),
    getLeadStatsServer(),
    checkEntityPermissions("lead"),
  ]);

  if (result.status !== "success" || !result.data) {
    notFound();
  }

  const t = await getTranslations("crm.leads");

  const actionItems = [
    createCreateAction(
      "create",
      t("createNewButton") ?? "Nuovo",
      getNewRoute("leads"),
      permissions.canCreate,
    ),
  ];

  return (
    <>
      <PageHeader actionItems={actionItems} />
      <LeadListPage
        leads={result.data}
        searchParams={params}
        pagination={result.pagination}
        permissions={permissions}
        stats={stats.data}
      />
    </>
  );
}
