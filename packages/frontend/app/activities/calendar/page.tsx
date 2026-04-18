// app/activities/calendar/page.tsx
import { ActivityCalendar } from "@/components/activity/calendar/activity-calendar";

export default function ActivityCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendario Attività</h1>
        <p className="text-muted-foreground">
          Visualizza e gestisci le tue attività nel calendario
        </p>
      </div>

      <ActivityCalendar />
    </div>
  );
}


