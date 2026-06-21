// app/activities/activity-list-client.tsx
"use client";

import { useState } from "react";
import { useActivities } from "@/hooks/use-activity";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { ActivityQueryInput } from "@/types/activitiy";

export function ActivityListClient() {
  const router = useRouter();
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

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-yellow-500/10 text-yellow-700",
    IN_PROGRESS: "bg-blue-500/10 text-blue-700",
    COMPLETED: "bg-green-500/10 text-green-700",
    CANCELLED: "bg-red-500/10 text-red-700",
  };

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
            <Card
              key={activity.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/activities/${activity.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{activity.subject}</h3>
                      <Badge className={statusColors[activity.status]}>
                        {activity.status}
                      </Badge>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                    
                    {activity.customer && (
                      <p className="text-sm text-muted-foreground">
                        {activity.customer.company.companyName}
                      </p>
                    )}

                    {activity.lead && (
                      <p className="text-sm text-muted-foreground">
                        {activity.lead.companyName} - {activity.lead.contactFirstName} {activity.lead.contactLastName} 
                      </p>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.scheduledStart), {
                        addSuffix: true,
                        locale: it,
                      })}
                    </p>
                  </div>
                  
                  <Badge
                    variant={
                      activity.priority === "URGENT" || activity.priority === "HIGH"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {activity.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
