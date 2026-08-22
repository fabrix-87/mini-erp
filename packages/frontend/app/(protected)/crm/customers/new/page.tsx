import CompanyFormPage from "@/components/company-form";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/server/auth";
import { getTranslations } from "next-intl/server";

export default async function newCompany() {
  await requirePermission("customer:create");
  const t = await getTranslations("crm.customers");

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[{ label: t("companyNewTitle") }]}
        title={t("companyNewTitle")}
        subtitle={t("companyNewDescription")}
      />
      <CompanyFormPage companyType="CUSTOMER" />
    </>
  );
}

// Metadata
export async function generateMetadata() {
  const t = await getTranslations("crm.customers");

  return {
    title: `${t("companyNewTitle")} | ${process.env.APP_NAME}`,
    description: t("companyNewDescription"),
  };
}
