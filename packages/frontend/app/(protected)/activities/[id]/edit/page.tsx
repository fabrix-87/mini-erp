// app/activities/[id]/edit/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchActivityByIdServer } from "@/services/server/activity";
import { ActivityForm } from "@/components/activity/activity-form";
import { Skeleton } from "@/components/ui/skeleton";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const activity = await fetchActivityByIdServer(parseInt(id));

    return (
      <Suspense fallback={<ActivityFormSkeleton />}>
        <ActivityForm activity={activity} isEditMode={true} />
      </Suspense>
    );
  } catch (error) {
    notFound();
  }
}

function ActivityFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
