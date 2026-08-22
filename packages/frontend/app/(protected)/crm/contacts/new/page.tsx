import ContactForm from "@/app/(protected)/crm/contacts/components/contact-form";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/server/auth";
import { getCompanyById } from "@/services/server/company-service";
import { getTranslations } from "next-intl/server";

interface Props {
  searchParams: Promise<{
    companyId: string;
  }>;
}

export default async function ContactNewPage({ searchParams }: Props) {
  await requirePermission("contact:create");
  const t = await getTranslations("crm.contacts");

  const { companyId } = await searchParams;

  const initialCompany = companyId ? await getCompanyById(companyId) : null;

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[{ label: t("contactNewTitle") }]}
        title={t("contactNewTitle")}
        subtitle={t("contactNewDescription")}
      />
      <ContactForm isNew={true} initialCompany={initialCompany} />;
    </>
  );
}

// Metadata
export async function generateMetadata() {
  const t = await getTranslations("crm.contacts");

  return {
    title: `${t("contactNewTitle")} | ${process.env.APP_NAME}`,
    description: t("contactNewDescription"),
  };
}
