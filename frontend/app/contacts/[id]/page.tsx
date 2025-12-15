import { dehydrate, QueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { HydrationBoundary } from '@/providers/hydration-boundary';
import ContactDetailsPage from '@/components/contact/contact-details';
import contactService from '@/services/contact-services';
import { contactKeys } from '@/hooks/contact-keys';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/)
});


interface ContactDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const queryClient = new QueryClient();
  const { id } = await params;
  // Validazione con Zod
  const validated = paramsSchema.safeParse({ id });
  if (!validated.success) {
    notFound();
  }
  
  const contactId = parseInt(validated.data.id);

  try {
    // Prefetch contact sul server
    await queryClient.prefetchQuery({
      queryKey: contactKeys.detail(contactId),
      queryFn: () => contactService.getById(contactId),
    });
  } catch (error) {
    console.error(error)
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContactDetailsPage />
    </HydrationBoundary>
  );
}
