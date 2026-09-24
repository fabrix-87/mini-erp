import { PageHeader } from "@/components/page-header";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllWarehouses, getWarehouseStats } from "@/services/server/warehouse-service";
import { PageHeaderAction } from "@/types/page-types";
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

  const [result, permissions] = await Promise.all([
    getAllWarehouses(params, 3600),
    checkEntityPermissions("warehouse"),
  ]);

  const t = await getTranslations('warehouse')

  const actionItems: PageHeaderAction[] = [
      createCreateAction(
        "create",
        t("createNewButton") ?? "Nuova",
        getNewRoute("warehouses"),
        permissions.canCreate,
      ),
    ];
  
  return (
    <>
      <PageHeader actionItems={actionItems}/>
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
