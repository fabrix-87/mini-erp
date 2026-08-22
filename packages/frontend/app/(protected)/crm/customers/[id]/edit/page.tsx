import { notFound } from "next/navigation";
import CompanyForm from "@/components/company-form";
import { requirePermission } from "@/lib/server/auth";
import { getCustomerById } from "@/services/server/customer-service";
import { PageIdProps } from "@/types/page-types";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { getDetailRoute } from "@/lib/navigation-routes";

export default async function EditCustomerPage({ params }: PageIdProps) {
  await requirePermission("customer:update");

  const { id } = await params;
  const result = await getCustomerById(id);
  const t = await getTranslations("crm.customers");

  if (!result) notFound();

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[
          {label: result.company.companyName, href: getDetailRoute('customers', id)},
          {label: t("companyEditTitle")}
        ]}
        title={`${t("companyEditTitle")}: ${result.company.companyName}`}
        subtitle={t("companyEditDescription")}
      />
      <CompanyForm initialData={result} companyType="CUSTOMER" />
    </>
  );
}

// Metadata
export async function generateMetadata({ params }: PageIdProps) {
  const t = await getTranslations("crm.customers");
  try {
    const { id } = await params;

    const customer = await getCustomerById(id, 3600);

    return {
      title: `${customer.company.companyName} - ${t("companyEditTitle")} | ${process.env.APP_NAME}`,
      description: `${t("companyEditDescription")} ${customer.company.companyName}`,
    };
  } catch {
    return {
      title: `${t("companyEditTitle")} | ${process.env.APP_NAME}`,
    };
  }
}
