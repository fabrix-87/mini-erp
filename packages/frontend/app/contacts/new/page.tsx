import ContactForm from "@/components/contact/contact-form";
import { requirePermission } from "@/lib/server/auth";

interface Props {
  searchParams: Promise<{
    companyId: string;
  }>;
}


export default async function ContactNewPage({ searchParams }: Props) {
  await requirePermission("contact:create");

  return <ContactForm isNew={true} companyId={(await searchParams).companyId} />;
}