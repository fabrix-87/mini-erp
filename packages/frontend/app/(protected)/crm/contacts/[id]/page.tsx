import { notFound } from "next/navigation";
import ContactDetailsPage from "@/app/(protected)/crm/contacts/components/contact-details";
import { contactIdSchema } from "@mini-erp/shared";
import { getContactById } from "@/services/server/contact-service";

interface ContactDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  // Validazione con Zod
  const validated = contactIdSchema.safeParse({ id });
  if (!validated.success) {
    notFound();
  }

  const data = await getContactById(id);

  if (!data) {
    notFound();
  }

  return <ContactDetailsPage contact={data} contactId={id} />;
}
