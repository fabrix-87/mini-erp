import CompanyForm from "@/components/company-form";
import { PageHeader } from "@/components/page-header";
import { getDetailRoute } from "@/lib/navigation-routes";
import { requirePermission } from "@/lib/server/auth";
import { getSupplierById } from "@/services/server/supplier-service";
import { PageIdProps } from "@/types/page-types";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function EditSupplierPage({ params }: PageIdProps) {
  await requirePermission("supplier:update");

  const { id } = await params;
  const result = await getSupplierById(id, 3600);
  const t = await getTranslations("crm.suppliers");

  if (!result) notFound();

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[
          { label: result.company.companyName, href: getDetailRoute("suppliers", id) },
          { label: t("companyEditTitle") },
        ]}
        title={`${t("companyEditTitle")}: ${result.company.companyName}`}
        subtitle={t("companyEditDescription")}
      />
      <CompanyForm initialData={result} companyType="SUPPLIER" />
    </>
  );
}

// Metadata
export async function generateMetadata({ params }: PageIdProps) {
  const t = await getTranslations("crm.suppliers");
  try {
    const { id } = await params;

    const customer = await getSupplierById(id, 3600);

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
