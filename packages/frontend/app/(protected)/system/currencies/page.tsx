import { requirePermission } from "@/lib/server/auth";
import { getAllCurrencies } from "@/services/server/currency-service";
import { CurrencyQueryInput } from "@mini-erp/shared";
import { currencyQuerySchema } from "@mini-erp/shared/validators/currency";
import CurrenciesContent from "./components/currencies-content";

interface PageProps {
  searchParams: Promise<CurrencyQueryInput>;
}

export default async function CurrenciesPage({ searchParams }: PageProps) {
  await requirePermission("currency:read");

  const queryParams: CurrencyQueryInput = currencyQuerySchema.parse(await searchParams);

  const currencies = await getAllCurrencies(queryParams);

  return <CurrenciesContent queryParams={queryParams} currenciesList={currencies} />;
}

export const metadata = {
  title: `Gestione Valute | ${process.env.APP_NAME}`,
  description: "Amministra le valute sistema",
};
