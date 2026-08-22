import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllCurrencies } from "@/services/server/currency-service";
import { CurrencyQueryInput } from "@mini-erp/shared";
import { currencyQuerySchema } from "@mini-erp/shared/validators/currency";
import CurrenciesContent from "./components/currencies-content";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";

interface PageProps {
  searchParams: Promise<CurrencyQueryInput>;
}

export default async function CurrenciesPage({ searchParams }: PageProps) {
  await requirePermission("currency:read");

  const queryParams: CurrencyQueryInput = currencyQuerySchema.parse(await searchParams);
  const [currencies, permissions, t] = await Promise.all([
    getAllCurrencies(queryParams),
    checkEntityPermissions("currency"),
    getTranslations("system.currencies"),
  ]);

  const actionItems = [
    createCreateAction(
      "create",
      t("createNewButton") ?? "Nuovo",
      getNewRoute("currencies"),
      permissions.canCreate,
    ),
  ];

  return (
    <>
      <PageHeader actionItems={actionItems} subtitle={t("description")} />
      <CurrenciesContent
        queryParams={queryParams}
        currenciesList={currencies}
        permissions={permissions}
      />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("system");

  return {
    title: `${t("currencies.title")} | ${process.env.APP_NAME}`,
    description: t("currencies.description"),
  };
}
