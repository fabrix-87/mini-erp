// app/activities/page.tsx - Server Component with SSR
import { Suspense } from "react";
import { fetchActivitiesPageData } from "@/services/server/activity";
import ActivitiesClient from "./activities-client";
import { ActivityPageSkeleton } from "./loading";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Disable static generation for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Get user from cookies/session
 * TODO: Replace with your actual auth logic
 */
async function getCurrentUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  
  if (!userCookie) {
    return null;
  }
  
  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get current user
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  // Parse search params for initial filters
  const page = Number(searchParams.page) || 1;
  const typeFilter = (searchParams.type as string) || "all";
  const statusFilter = (searchParams.status as string) || "all";
  const priorityFilter = (searchParams.priority as string) || "all";
  const dateFilter = (searchParams.date as string) || "all";
  const searchQuery = (searchParams.search as string) || "";

  // Build initial params
  const initialParams: any = {
    page,
    limit: 20,
    sortBy: "scheduledDate",
    sortOrder: "ASC",
  };

  if (typeFilter !== "all") initialParams.activityType = typeFilter;
  if (statusFilter !== "all") initialParams.status = statusFilter;
  if (priorityFilter !== "all") initialParams.priority = priorityFilter;
  if (searchQuery) initialParams.search = searchQuery;

  // Handle date filters
  if (dateFilter !== "all") {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    switch (dateFilter) {
      case "today":
        initialParams.dateFrom = today.toISOString().split("T")[0];
        initialParams.dateTo = today.toISOString().split("T")[0];
        break;
      case "tomorrow":
        initialParams.dateFrom = tomorrow.toISOString().split("T")[0];
        initialParams.dateTo = tomorrow.toISOString().split("T")[0];
        break;
      case "week":
        initialParams.dateFrom = today.toISOString().split("T")[0];
        initialParams.dateTo = weekEnd.toISOString().split("T")[0];
        break;
      case "overdue":
        initialParams.dateTo = today.toISOString().split("T")[0];
        initialParams.status = "planned";
        break;
    }
  }

  // Fetch initial data server-side
  const initialData = await fetchActivitiesPageData(initialParams, user.id);

  return (
    <Suspense fallback={<ActivityPageSkeleton />}>
      <ActivitiesClient
        initialActivities={initialData.activities}
        initialStats={initialData.stats}
        initialPagination={initialData.pagination}
        user={user}
        initialFilters={{
          page,
          typeFilter,
          statusFilter,
          priorityFilter,
          dateFilter,
          searchQuery,
        }}
      />
    </Suspense>
  );
}
