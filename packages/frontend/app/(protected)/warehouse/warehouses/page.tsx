import { PageHeader } from "@/components/page-header";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllWarehouses, getWarehouseStats } from "@/services/server/warehouse-service";
import { WarehouseQueryInput, warehouseQuerySchema } from "@mini-erp/shared";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface WarehousesPageProps {
  searchParams: Promise<WarehouseQueryInput>;
}

export default async function CustomersPage({ searchParams }: WarehousesPageProps) {
  await requirePermission("warehouse:read");

  const params = await searchParams;
  const queryParams: WarehouseQueryInput = warehouseQuerySchema.parse(searchParams);

  const [result, stats, permissions] = await Promise.all([
    getAllWarehouses(params, 3600),
    getWarehouseStats(),
    checkEntityPermissions("warehouse"),
  ]);

  return (
    <>
      <PageHeader />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("warehouse.warehouses");

  return {
    title: `${t("title")} | ${process.env.APP_NAME}`,
    description: t("description"),
  };
}
