// app/activities/calendar/page.tsx
import { Suspense } from "react";
import { ActivityCalendar } from "@/components/activity/calendar/activity-calendar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendario Attività</h1>
        <p className="text-muted-foreground">
          Visualizza e gestisci le tue attività nel calendario
        </p>
      </div>

      <Suspense fallback={<CalendarSkeleton />}>
        <ActivityCalendar />
      </Suspense>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
      <Skeleton className="h-[400px]" />
      <Skeleton className="h-[600px]" />
    </div>
  );
}
