import { notFound } from "next/navigation";
import ContactDetailsPage from "@/app/(protected)/crm/contacts/components/contact-details";
import { getContactById } from "@/services/server/contact-service";
import { PageIdProps } from "@/types/page-types";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { createDeleteServerAction, createEditAction } from "@/helpers/page-header-actions-helper";
import { getEditRoute } from "@/lib/navigation-routes";
import { deleteContactAction } from "@/actions/contact-actions";
import { getInitials } from "@/helpers/string-helper";

export default async function ContactDetailPage({ params }: PageIdProps) {
  await requirePermission("contact:read");

  const { id } = await params;
  const [contact, permissions] = await Promise.all([
    getContactById(id, 3600),
    checkEntityPermissions("contact"),
  ]);
  const t = await getTranslations("crm.contacts");
  const tc = await getTranslations("crm");

  if (!contact) {
    notFound();
  }

  const fullname = `${contact.firstName} ${contact.lastName}`;
  const primaryCompany = contact.companies.find((c) => c.isPrimaryContact);
  const deleteAction = deleteContactAction.bind(null, id); // bind per iniettare l'id

  return (
    <>
      <PageHeader
        extraBreadcrumbs={[
          { label: fullname },
        ]}
        title={fullname}
        breadcrumbLabel={fullname}
        leading={
          <div className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-full bg-primary/10 font-semibold text-base text-primary">
            {getInitials(contact.firstName, contact.lastName)}
          </div>
        }
        badges={[
          <Badge key="status" variant={contact.active ? "default" : "secondary"}>
            {contact.active ? t("active") : t("inactive")}
          </Badge>,
        ]}
        meta={
          primaryCompany ? (
            <p className="text-sm text-muted-foreground">
              {primaryCompany.position && `${primaryCompany.position} · `}
              {primaryCompany.company.companyName}
            </p>
          ) : t('contactDetailDescription')
        }
        actionItems={[
          createEditAction(
            "edit",
            tc("editButton"),
            getEditRoute("contact", id),
            permissions.canUpdate,
          ),
          createDeleteServerAction("delete", tc("deleteButton"), deleteAction, {
            title: tc("deleteDialogTitle", { name: fullname }),
            description: tc("deleteDialogDescription"),
          }),
        ]}
      />
      <ContactDetailsPage contact={contact} contactId={id} />
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
      title: `${fullname} - ${t("contactDetailTitle")} | ${process.env.APP_NAME}`,
      description: `${t("contactDetailDescription")} ${fullname}`,
    };
  } catch {
    return {
      title: `${t("contactDetailTitle")} | ${process.env.APP_NAME}`,
    };
  }
}
