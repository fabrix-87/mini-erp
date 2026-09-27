import { PageHeader } from "@/components/page-header";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllWarehouses, getWarehouseListStats } from "@/services/server/warehouse-service";
import { WarehouseQueryInput, warehouseQuerySchema } from "@mini-erp/shared";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WarehouseListPage } from "./components/warehouse-list-page";

interface WarehousesPageProps {
  searchParams: Promise<WarehouseQueryInput>;
}

export default async function CustomersPage({ searchParams }: WarehousesPageProps) {
  await requirePermission("warehouse:read");

  const params = await searchParams;
  const queryParams: WarehouseQueryInput = warehouseQuerySchema.parse(params);

  const [result, stats, permissions] = await Promise.all([
    getAllWarehouses(queryParams, 3600),
    getWarehouseListStats(),
    checkEntityPermissions("warehouse"),
  ]);

  const t = await getTranslations("warehouse");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("description")} />
      <WarehouseListPage
        pagination={result.pagination}
        stats={stats.data}
        permissions={permissions}
        searchParams={queryParams}
        warehouses={result.data}
      />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("warehouse");

  return {
    title: `${t("title")} | ${process.env.APP_NAME}`,
    description: t("description"),
  };
}
