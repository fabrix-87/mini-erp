import ContactForm from "@/components/contact/contact-form";
import { requirePermission } from "@/lib/server/auth";
import { getContactById } from "@/services/server/contact-service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactEditPage({ params }: Props) {
  await requirePermission("contact:update");

  const { id } = await params;

  const data = await getContactById(id);
  
  return <ContactForm isNew={false} contact={data} />;
}
