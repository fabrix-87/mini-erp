// app/components/activity/activity-list.tsx
"use client";

import { Activity } from "@/types/activitiy-types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { formatDateIT } from "@/helpers/date-helper";
import { ActivitySheet } from "./activity-sheet";
import { CreateActivityFormValues } from "@mini-erp/shared";
import { toast } from "sonner";
import { createActivityAction } from "@/actions/activity-actions";

interface ActivityListProps {
  activities: Activity[];
  leadId?: string;
  opportunityId?: string;
}

export function ActivityList({ activities, leadId, opportunityId }: ActivityListProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const t = useTranslations("activities");

  const onSubmit = async (data: CreateActivityFormValues) => {
    const result = await createActivityAction(data);
    if (result.success && result.data) {
      toast.success(t("createSuccess"));
    } else {
      toast.error(result.error ?? t("createError"));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4" />
          {t("nextActivities", { activitiesLength: activities.length })}
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          {t("newActivity")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
            <CalendarPlus className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">{t("noActivities")}</p>
            <Button size="sm" variant="ghost" className="mt-3" onClick={() => setSheetOpen(true)}>
              {t("createNext")}
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{activity.subject}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateIT(new Date(activity.scheduledStart))}
                    {activity.assignedUser &&
                      ` · ${activity.assignedUser.details?.firstName} ${activity.assignedUser.details?.lastName}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t(`type.${activity.type}`)}</Badge>
                  <Badge>{t(`status.${activity.status}`)}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}

        <ActivitySheet
          leadId={leadId}
          opportunityId={opportunityId}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onSubmit={onSubmit}
        />
      </CardContent>
    </Card>
  );
}
