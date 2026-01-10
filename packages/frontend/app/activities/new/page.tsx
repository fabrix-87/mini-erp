// app/activities/new/page.tsx
import { Suspense } from "react";
import { ActivityForm } from "@/components/activity/activity-form";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchParams {
  customerId?: string;
  contactId?: string;
  date?: string;
}

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<ActivityFormSkeleton />}>
      <ActivityForm
        preselectedCustomerId={params.customerId}
        preselectedContactId={params.contactId}
        preselectedDate={params.date}
      />
    </Suspense>
  );
}

function ActivityFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
