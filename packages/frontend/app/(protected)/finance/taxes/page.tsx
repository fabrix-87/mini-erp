import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllTaxRules } from "@/services/server/tax-service";
import { TaxRuleQueryInput, taxRuleQuerySchema } from "@mini-erp/shared";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TaxesContent from "./components/tax-rules-content";

interface PageProps {
  searchParams: Promise<TaxRuleQueryInput>;
}

export default async function TaxesPage({ searchParams }: PageProps) {
  await requirePermission("tax:read");

  const queryParams: TaxRuleQueryInput = taxRuleQuerySchema.parse(await searchParams);
  const [taxes, permissions] = await Promise.all([
    getAllTaxRules(queryParams),
    checkEntityPermissions("tax"),
  ]);

  return <TaxesContent permissions={permissions} taxesList={taxes} queryParams={queryParams} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("finance");

  return {
    title: `${t("taxes.title")} | ${process.env.APP_NAME}`,
    description: t("taxes.description"),
  };
}
