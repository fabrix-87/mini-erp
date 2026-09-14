// app/activities/activity-list-client.tsx
"use client";

import { useState } from "react";
import { useActivities } from "@/hooks/use-activity";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityQueryInput } from "@/types/activitiy-types";
import { ActivityCard } from "@/components/activity/activity-card";
import { useNavigation } from "@/hooks/use-navigation";

export function ActivityListClient() {
  const router = useRouter();
  const { navigateToDetail } = useNavigation();
  const [filters, setFilters] = useState<ActivityQueryInput>({
    page: 1,
    limit: 20,
    overdue: false,
    myActivities: false,
    sortBy: "scheduledStart",
    sortOrder: "asc",
  });

  const { data: activitiesData, isLoading } = useActivities(filters);

  const activities = activitiesData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Elenco Attività</h2>
        <Button onClick={() => router.push("/activities/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Attività
        </Button>
      </div>

      {isLoading ? (
        <div>Caricamento...</div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Nessuna attività trovata. Inizia creando la prima!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              className="bg-card"
              activity={activity}
              onClick={() => navigateToDetail("activities", activity.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
