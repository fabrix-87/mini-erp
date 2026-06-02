import { dehydrate, QueryClient } from "@tanstack/react-query";
import { HydrationBoundary } from "@/providers/hydration-boundary";
import ContactListPage from "@/components/contact/contact-list";
import { getAllContacts } from "@/services/server/contact-service";
import { contactKeys } from "@/hooks/contact-keys";
import { ContactQueryInput, ContactSortField } from "@/types/contact-types";
import { SortOrder } from "@mini-erp/shared/constants";
import { contactQuerySchema } from "@mini-erp/shared";
import { requirePermission } from "@/lib/server/auth";
import { notFound } from "next/navigation";

interface ContactsPageProps {
  searchParams: Promise<ContactQueryInput>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  await requirePermission("contact:read");

  const params: ContactQueryInput = contactQuerySchema.parse(await searchParams);

  const result = await getAllContacts(params);

  if (result.status !== "success" || !result.data) {
    notFound();
  }

  return <ContactListPage params={params} data={result} />;
}
