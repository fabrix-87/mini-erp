import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllTaxRules } from "@/services/server/tax-service";
import { TaxRuleQueryInput, taxRuleQuerySchema } from "@mini-erp/shared";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TaxesContent from "./components/tax-rules-content";
import { PageHeader } from "@/components/page-header";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";

interface PageProps {
  searchParams: Promise<TaxRuleQueryInput>;
}

export default async function TaxesPage({ searchParams }: PageProps) {
  await requirePermission("tax:read");

  const queryParams: TaxRuleQueryInput = taxRuleQuerySchema.parse(await searchParams);
  const [taxes, permissions, t] = await Promise.all([
    getAllTaxRules(queryParams),
    checkEntityPermissions("tax"),
    getTranslations("finance.taxes"),
  ]);

  const clientQueryParams = {
    ...queryParams,
    minRate: queryParams.minRate?.toString(),
    maxRate: queryParams.maxRate?.toString(),
  };

  const actionItems = [
      createCreateAction(
        "create",
        t("createNewButton") ?? "Nuovo",
        getNewRoute("taxes"),
        permissions.canCreate,
      ),
    ];

  return (
    <>
      <PageHeader subtitle={t('description')} actionItems={actionItems} />
      <TaxesContent permissions={permissions} taxesList={taxes} queryParams={clientQueryParams} />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("finance");

  return {
    title: `${t("taxes.title")} | ${process.env.APP_NAME}`,
    description: t("taxes.description"),
  };
}
