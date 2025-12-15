import { dehydrate, QueryClient } from '@tanstack/react-query';
import { HydrationBoundary } from '@/providers/hydration-boundary';
import ContactListPage from '@/components/contact/contact-list';
import contactService from '@/services/contact-services';
import { contactKeys } from '@/hooks/contact-keys';
import { ContactQueryParams, ContactSortField, SortOrder } from '@/types/contact';

interface ContactsPageProps {
  searchParams: Promise<ContactQueryParams>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const queryClient = new QueryClient();
  
  const resolvedSearchParams = await searchParams;

  const params: ContactQueryParams = {
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
    queryFn: () => contactService.getAll(params),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContactListPage />
    </HydrationBoundary>
  );
}
