import { notFound } from "next/navigation";
import ContactDetailsPage from "@/components/contact/contact-details";
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

  const contactId = Number(validated.data.id);

  const data = await getContactById(Number(contactId));

  if (!data) {
    notFound();
  }

  return <ContactDetailsPage contact={data} contactId={contactId} />;
}
