// app/activities/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchActivityByIdServer } from "@/services/server/activity";
import { ActivityDetailClient } from "@/components/activity/activity-detail-client";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  try {
    const activity = await fetchActivityByIdServer(parseInt(id));

    return (
      <Suspense fallback={<ActivityDetailSkeleton />}>
        <ActivityDetailClient activity={activity} />
      </Suspense>
    );
  } catch (error) {
    notFound();
  }
}

function ActivityDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
