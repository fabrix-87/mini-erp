// app/(protected)/crm/opportunities/page.tsx
import { OpportunityListPage } from "./components/opportunity-list-page";
import { opportunityQuerySchema, type OpportunityQueryInput } from "@mini-erp/shared";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllOpportunities, getOpportunityStatsServer } from "@/services/server/opportunity-service";
import { getTranslations } from "next-intl/server";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";

interface OpportunitiesPageProps {
  searchParams: Promise<OpportunityQueryInput>;
}

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  await requirePermission("opportunity:read");

  const params: OpportunityQueryInput = opportunityQuerySchema.parse(await searchParams);

  const [result, stats, permissions] = await Promise.all([
    getAllOpportunities(params, 3600),
    getOpportunityStatsServer(),
    checkEntityPermissions("opportunity"),
  ]);

  if (result.status !== "success" || !result.data) notFound();

  const t = await getTranslations("crm.opportunities");

  const actionItems = [
    createCreateAction(
      "create",
      t("createNewButton") ?? "Nuova",
      getNewRoute("opportunities"),
      permissions.canCreate,
    ),
  ];

  return (
    <>
      <PageHeader actionItems={actionItems} />
      <OpportunityListPage
        opportunities={result.data}
        searchParams={params}
        pagination={result.pagination}
        permissions={permissions}
        stats={stats.data}
      />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("crm");
  return {
    title: `${t("opportunities.title")} | ${process.env.APP_NAME}`,
    description: t("opportunities.description"),
  };
}