import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export default async function ProductListPage() {
  const t = await getTranslations("catalog.products");
  return (
    <>
      <PageHeader title={t("title")} subtitle={t("description")} />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("catalog.products");

  return {
    title: `${t("title")} | ${process.env.APP_NAME}`,
    description: t("description"),
  };
}
