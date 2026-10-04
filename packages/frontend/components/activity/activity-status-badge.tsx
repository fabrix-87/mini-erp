// components/activity/activity-status-badge.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFormContext, useWatch } from "react-hook-form";
import { CreateActivityFormValues } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import {
  ActivityPriorityColors,
  ActivityStatusColors,
  ActivityTypeIcons,
} from "@/constants/activity-priority-colors";

export function ActivityStatusBadge() {
  const { control } = useFormContext<CreateActivityFormValues>();
  const t = useTranslations("activities");
  const type = useWatch({ control, name: "type" });
  const status = useWatch({ control, name: "status" }) ?? "SCHEDULED";
  const priority = useWatch({ control, name: "priority" });
  const priorityColor = ActivityPriorityColors[priority ?? "LOW"];
  const statusColor = ActivityStatusColors[status];
  const Icon = ActivityTypeIcons[type];
  return (
    <Card className={cn(statusColor.border, statusColor.accentBorder, statusColor.text)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div>
              <Icon className="h-8 w-8" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{t("activityStatus")}</p>
              <p className="text-xl font-bold capitalize">{t(`status.${status}`)}</p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn("shrink-0", priorityColor.border, priorityColor.text, priorityColor.bg)}
          >
            {`${t("form.priority")}: ${t(`priority.${priority}`)}`}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
