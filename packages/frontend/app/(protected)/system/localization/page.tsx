import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import {  LanguageQueryInput, languageQuerySchema } from "@mini-erp/shared";
import LanguageContent from "./components/language-content";
import { getAllLanguages } from "@/services/server/language-service";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface PageProps {
  searchParams: Promise<LanguageQueryInput>;
}

export default async function CurrenciesPage({ searchParams }: PageProps) {
  await requirePermission("language:read");

  const queryParams: LanguageQueryInput = languageQuerySchema.parse(await searchParams);
  const [languages, permissions ] = await Promise.all([
    getAllLanguages(queryParams),
    checkEntityPermissions("language"),
  ]);

  return (
    <LanguageContent
      queryParams={queryParams}
      languagesList={languages}
      permissions={permissions}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("system");

  return {
    title: `${t("localization.title")} | ${process.env.APP_NAME}`,
    description: t("localization.description"),
  };
}