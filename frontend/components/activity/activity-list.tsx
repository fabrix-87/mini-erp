// app/components/activities/activity-list.tsx
"use client";

import { Activity } from "@/types/activitiy";
import { ActivityCard } from "./activity-card";
import { CalendarIcon } from "lucide-react";

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
  onActivityClick: (id: number) => void;
}

export function ActivityList({
  activities,
  isLoading,
  onActivityClick,
}: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Caricamento...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Nessuna attività trovata</p>
        <p className="text-sm">
          Prova a cambiare i filtri o crea una nuova attività
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onClick={() => onActivityClick(activity.id)}
        />
      ))}
    </div>
  );
}
