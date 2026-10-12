import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export default async function NewProductPage() {
    const t = await getTranslations("catalog.products.new")
    return (
        <>
          <PageHeader title={t("title")} subtitle={t("description")} />
        </>
      );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("catalog.products.new");

  return {
    title: `${t("title")} | ${process.env.APP_NAME}`,
    description: t("description"),
  };
}
