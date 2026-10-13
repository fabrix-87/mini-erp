import { PageHeader } from "@/components/page-header";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllProducts } from "@/services/server/product-service";
import { PageHeaderAction } from "@/types/page-types";
import { ProductQueryInput, productQuerySchema } from "@mini-erp/shared";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductTable } from "./components/product-table";

interface ProductListPageProps {
  searchParams: Promise<ProductQueryInput>;
}

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
  await requirePermission("product:read");

  const params: ProductQueryInput = productQuerySchema.parse(await searchParams);

  const [result, stats, permissions] = await Promise.all([
    getAllProducts(params),
    async () => null,
    checkEntityPermissions("product"),
  ]);
  const t = await getTranslations("catalog.products");

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
      <ProductTable data={result.data} pagination={result.pagination} permissions={permissions} />
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
