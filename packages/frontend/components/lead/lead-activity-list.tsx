// components/lead/lead-activities-tab.tsx
"use client";

import { Activity } from "@mini-erp/shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { LeadActivitySheet } from "./lead-activity-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface LeadActivityListProps {
  leadId: number;
  activities: Activity[];
}

export function LeadActivityList({ leadId, activities: initialActivities }: LeadActivityListProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  // Optimistic local list: starts from server-fetched data
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  /**
   * Optimistically prepends the newly created activity to the list.
   * The RSC revalidation triggered by the server action will eventually sync the real data.
   */
  function handleActivityCreated(newActivity: Activity) {
    setActivities((prev) => [newActivity, ...prev]);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4" />
          Prossime attività ({activities.length})
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Nuova attività
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
            <CalendarPlus className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">Nessuna attività pianificata</p>
            <Button size="sm" variant="ghost" className="mt-3" onClick={() => setSheetOpen(true)}>
              Crea la prima attività
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{activity.subject}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(activity.scheduledStart), "dd MMM yyyy HH:mm", { locale: it })}
                    {activity.assignedUser &&
                      ` · ${activity.assignedUser.details?.firstName} ${activity.assignedUser.details?.lastName}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activity.type}</Badge>
                  <Badge>{activity.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}

        <LeadActivitySheet
          leadId={leadId}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onSuccess={handleActivityCreated}
        />
      </CardContent>
    </Card>
  );
}
