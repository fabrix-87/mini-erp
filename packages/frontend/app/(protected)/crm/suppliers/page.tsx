import CompanyListPage from "@/components/company/company-list-page";
import { PageHeader } from "@/components/page-header";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllSuppliers, getSupplierStats } from "@/services/server/supplier-service";
import { SupplierQueryInput, supplierQuerySchema } from "@mini-erp/shared";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

interface SuppliersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  await requirePermission("supplier:read");

  const params: SupplierQueryInput = supplierQuerySchema.parse(await searchParams);

  const [result, stats, permissions] = await Promise.all([
    getAllSuppliers(params),
    getSupplierStats(),
    checkEntityPermissions("supplier"),
  ]);

  const t = await getTranslations("crm.suppliers");

  const actionItems = [
    createCreateAction(
      "create",
      t("createNewButton") ?? "Nuovo",
      getNewRoute("suppliers"),
      permissions.canCreate,
    ),
  ];

  if (result.status !== "success" || !result.data) {
    notFound();
  }

  return (
    <>
      <PageHeader actionItems={actionItems} />
      <CompanyListPage
        paginatedData={result}
        companyType="SUPPLIER"
        searchParams={params}
        stats={stats}
      />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("crm.suppliers");

  return {
    title: `${t("title")} | ${process.env.APP_NAME}`,
    description: t("description"),
  };
}
