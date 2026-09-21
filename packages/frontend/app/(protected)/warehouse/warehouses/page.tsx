import { WarehouseQueryInput } from "@mini-erp/shared";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";


interface WarehousesPageProps {
  searchParams: Promise<WarehouseQueryInput>;
}

export default async function CustomersPage({ searchParams }: WarehousesPageProps) {
   return (
    <>
      Warehouse
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
