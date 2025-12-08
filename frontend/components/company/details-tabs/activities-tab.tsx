// components/company/details-tabs/activities-tab.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, User, Clock } from "lucide-react";
import { getActivities } from "@/lib/api/modules/activity";

interface CompanyActivitiesTabProps {
  companyId: number;
}

export function CompanyActivitiesTab({ companyId }: CompanyActivitiesTabProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["activities", { companyId }],
    queryFn: () => getActivities({ companyId, page: 1, limit: 50 }),
  });

  const activities = data?.data || [];

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      CALL: "📞",
      EMAIL: "📧",
      MEETING: "🤝",
      NOTE: "📝",
      TASK: "✓",
      OTHER: "📌",
    };
    return icons[type] || "📌";
  };

  const getActivityTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      CALL: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      EMAIL: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      MEETING: "bg-green-500/10 text-green-700 border-green-500/20",
      NOTE: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      TASK: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      OTHER: "bg-gray-500/10 text-gray-700 border-gray-500/20",
    };
    return colors[type] || "";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Attività ({activities.length})</CardTitle>
        <Button
          size="sm"
          onClick={() =>
            router.push(`/dashboard/activities/new?companyId=${companyId}`)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuova Attività
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nessuna attività registrata
            </p>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/activities/new?companyId=${companyId}`)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Registra la prima attività
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <Card key={activity.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{activity.subject}</h4>
                          <Badge
                            variant="outline"
                            className={getActivityTypeBadge(activity.type)}
                          >
                            {activity.type}
                          </Badge>
                        </div>
                        <Badge
                          variant={
                            activity.status === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {activity.activityDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(activity.activityDate)}
                          </div>
                        )}
                        
                        {activity.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.duration} min
                          </div>
                        )}

                        {activity.assignedUser && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.assignedUser.username}
                          </div>
                        )}
                      </div>

                      {activity.outcome && (
                        <div className="pt-2 border-t">
                          <p className="text-xs">
                            <span className="font-medium">Esito: </span>
                            {activity.outcome}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}