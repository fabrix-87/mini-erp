import CompanyListPage from "@/components/company/company-list-page";
import { PageHeader } from "@/components/page-header";
import { createCreateAction } from "@/helpers/page-header-actions-helper";
import { getNewRoute } from "@/lib/navigation-routes";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { getAllCustomers, getCustomerStats } from "@/services/server/customer-service";
import { CustomerQueryInput, customerQuerySchema } from "@mini-erp/shared";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

interface CustomersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  await requirePermission("customer:read");

  const params: CustomerQueryInput = customerQuerySchema.parse(await searchParams);

  const [result, stats, permissions] = await Promise.all([
    getAllCustomers(params),
    getCustomerStats(),
    checkEntityPermissions("customer"),
  ]);

  const t = await getTranslations("crm.customers");

  const actionItems = [
    createCreateAction(
      "create",
      t("createNewButton") ?? "Nuovo",
      getNewRoute("customers"),
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
        companyType="CUSTOMER"
        searchParams={params}
        stats={stats}
      />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("crm.customers");

  return {
    title: `${t("title")} | ${process.env.APP_NAME}`,
    description: t("description"),
  };
}
