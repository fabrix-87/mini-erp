// components/activity/activity-status-badge.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityStatus, ActivityPriority } from "@/types/activitiy";

interface ActivityStatusBadgeProps {
  status: ActivityStatus;
  priority: ActivityPriority;
}

export function ActivityStatusBadge({
  status,
  priority,
}: ActivityStatusBadgeProps) {
  return (
    <Card
      className={
        status === "COMPLETED"
          ? "bg-green-500/5 border-green-500/20"
          : status === "IN_PROGRESS"
          ? "bg-blue-500/5 border-blue-500/20"
          : status === "CANCELLED"
          ? "bg-red-500/5 border-red-500/20"
          : "bg-yellow-500/5 border-yellow-500/20"
      }
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Stato Attività</p>
            <p className="text-xl font-bold capitalize">{status}</p>
          </div>
          <Badge
            variant={
              priority === "HIGH" || priority === "URGENT"
                ? "destructive"
                : "secondary"
            }
            className="text-sm px-3 py-1"
          >
            Priorità: {priority}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
