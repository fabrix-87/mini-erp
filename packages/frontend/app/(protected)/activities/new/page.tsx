// app/activities/new/page.tsx
import { ActivityForm } from "@/components/activity/activity-form";
import { requirePermission } from "@/lib/server/auth";
import { getLeadByIdServer } from "@/services/server/lead-service";

interface SearchParams {
  customerId?: string;
  contactId?: string;
  leadId?: string;
  date?: string;
}

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requirePermission("activity:create");

  const params = await searchParams;

  return (
    <ActivityForm
      preselectedCustomerId={params.customerId}
      preselectedContactId={params.contactId}
      preselectedLeadId={params.leadId}
      preselectedDate={params.date}
    />
  );
}
