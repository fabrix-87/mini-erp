// app/activities/[id]/page.tsx
import { notFound } from "next/navigation";
import { fetchActivityByIdServer } from "@/services/server/activity";
import { ActivityDetailClient } from "@/components/activity/activity-detail-client";
import { requirePermission } from "@/lib/server/auth";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("activity:read");

  const { id } = await params;
  
  try {
    const activity = await fetchActivityByIdServer(parseInt(id));    

    return (<ActivityDetailClient activity={activity} />);
  } catch (error) {
    notFound();
  }
}

