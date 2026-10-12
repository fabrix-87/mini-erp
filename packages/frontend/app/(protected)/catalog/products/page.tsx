import { PageHeader } from "@/components/page-header";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";
import { checkEntityPermissions } from "@/lib/server/auth";
import { PageHeaderAction } from "@/types/page-types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export default async function ProductListPage() {
  const t = await getTranslations("catalog.products");

  const [result, stats, permissions] = await Promise.all([
    async () => null,
    async () => null,
    checkEntityPermissions("product"),
  ]);

  const actionItems: PageHeaderAction[] = [
    createCreateAction(
      "create",
      t("createNewButton") ?? "Nuova",
      getNewRoute("products"),
      permissions.canCreate,
    ),
  ];

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("description")} actionItems={actionItems} />
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
