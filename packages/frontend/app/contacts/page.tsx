import { dehydrate, QueryClient } from '@tanstack/react-query';
import { HydrationBoundary } from '@/providers/hydration-boundary';
import ContactListPage from '@/components/contact/contact-list';
import { getAllContacts } from '@/services/server/contact';
import { contactKeys } from '@/hooks/contact-keys';
import { ContactQueryInput, ContactSortField } from '@/types/contact';
import { SortOrder } from '@mini-erp/shared/constants';

interface ContactsPageProps {
  searchParams: Promise<ContactQueryInput>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const queryClient = new QueryClient();
  
  const resolvedSearchParams = await searchParams;

  const params: ContactQueryInput = {
    page: resolvedSearchParams.page || 1,
    limit: resolvedSearchParams.limit || 20,
    search: resolvedSearchParams.search,
    sortBy: (resolvedSearchParams.sortBy as ContactSortField) || 'firstName',
    sortOrder: (resolvedSearchParams.sortOrder as SortOrder) || 'asc',
    companyId: resolvedSearchParams.companyId,
    active: resolvedSearchParams.active,
    isPrimaryContact: resolvedSearchParams.isPrimaryContact,
    department: resolvedSearchParams.department,
    position: resolvedSearchParams.position,
  };

  // Prefetch usando contact-services
  await queryClient.prefetchQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => getAllContacts(params),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContactListPage />
    </HydrationBoundary>
  );
}
