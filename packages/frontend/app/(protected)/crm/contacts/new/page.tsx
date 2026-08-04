import ContactForm from "@/app/(protected)/crm/contacts/components/contact-form";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/server/auth";
import { getCompanyById } from "@/services/server/company-service";

interface Props {
  searchParams: Promise<{
    companyId: string;
  }>;
}

export default async function ContactNewPage({ searchParams }: Props) {
  await requirePermission("contact:create");

  const { companyId } = await searchParams;

  const initialCompany = companyId ? await getCompanyById(companyId) : null;

  return (
    <>
      <PageHeader />
      <ContactForm isNew={true} initialCompany={initialCompany} />;
    </>
  );
}
