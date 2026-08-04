import ContactListPage from "@/app/(protected)/crm/contacts/components/contact-list";
import { getAllContacts } from "@/services/server/contact-service";
import { ContactQueryInput } from "@/types/contact-types";
import { contactQuerySchema } from "@mini-erp/shared";
import { checkEntityPermissions, requirePermission } from "@/lib/server/auth";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getNewRoute } from "@/lib/navigation-routes";
import { createCreateAction } from "@/helpers/page-header-actions-helper";

interface ContactsPageProps {
  searchParams: Promise<ContactQueryInput>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  await requirePermission("contact:read");

  const params: ContactQueryInput = contactQuerySchema.parse(await searchParams);

  const [result, permissions] = await Promise.all([
    getAllContacts(params),
    checkEntityPermissions("contact"),
  ]);

  if (result.status !== "success" || !result.data) {
    notFound();
  }

  const t = await getTranslations("crm.contacts");

  const actionItems = [
    createCreateAction(
      "create-contact",
      t("createNewButton") ?? "Nuovo",
      getNewRoute("contacts"),
      permissions.canCreate,
    ),
  ];

  return (
    <>
      <PageHeader actionItems={actionItems} />
      <ContactListPage params={params} data={result} />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("crm");

  return {
    title: `${t("contacts.title")} | ${process.env.APP_NAME}`,
    description: t("contacts.description"),
  };
}
