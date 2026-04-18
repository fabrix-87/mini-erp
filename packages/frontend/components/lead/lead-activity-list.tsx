// components/lead/lead-activities-tab.tsx
"use client";

import { Activity } from "@mini-erp/shared/types";
import { ActivityStatus, ActivityType } from "@mini-erp/shared/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";

interface LeadActivityListProps {
  leadId: number;
  activities: Activity[];
}

export function LeadActivityList({ leadId, activities }: LeadActivityListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Prossime attività ({activities.length})
        </h3>
        <Button asChild size="sm" variant="outline">
          <Link href={`/activities/new?leadId=${leadId}`}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nuova attività
          </Link>
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
          <CalendarPlus className="mb-2 h-8 w-8 opacity-40" />
          <p className="text-sm">Nessuna attività pianificata</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{activity.subject}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(activity.scheduledStart), "dd MMM yyyy HH:mm", { locale: it })}
                  {activity.assignedUser && ` · ${activity.assignedUser.details?.firstName} ${activity.assignedUser.details?.lastName}`}
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
    </div>
  );
}