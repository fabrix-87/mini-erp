import ContactForm from "@/app/(protected)/crm/contacts/components/contact-form";
import { PageHeader } from "@/components/page-header";
import { getDetailRoute } from "@/lib/navigation-routes";
import { requirePermission } from "@/lib/server/auth";
import { getContactById } from "@/services/server/contact-service";
import { PageIdProps } from "@/types/page-types";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function ContactEditPage({ params }: PageIdProps) {
  await requirePermission("contact:update");

  const { id } = await params;  
  const data = await getContactById(id);
  
  if (!data) notFound();
  
  const fullname = `${data.firstName} ${data.lastName}`;
  const t = await getTranslations("crm.contacts");

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[
          { label: fullname, href: getDetailRoute("contacts", id) },
          { label: t("contactEditTitle") },
        ]}
        title={`${t("contactEditTitle")}: ${fullname}`}
        subtitle={t("contactEditDescription")}
      />
      <ContactForm isNew={false} contact={data} />
    </>
  );
}

// Metadata
export async function generateMetadata({ params }: PageIdProps) {
  const t = await getTranslations("crm.contacts");
  try {
    const { id } = await params;

    const contact = await getContactById(id, 3600);

    const fullname = `${contact.firstName} ${contact.lastName}`;

    return {
      title: `${fullname} - ${t("contactEditTitle")} | ${process.env.APP_NAME}`,
      description: `${t("contactEditDescription")} ${fullname}`,
    };
  } catch {
    return {
      title: `${t("contactEditTitle")} | ${process.env.APP_NAME}`,
    };
  }
}
