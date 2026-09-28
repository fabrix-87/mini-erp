// components/activity/activity-status-badge.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFormContext, useWatch } from "react-hook-form";
import { CreateActivityFormValues } from "@mini-erp/shared";
import {
  ACTIVITY_PRIORITY_VARIANTS,
  ACTIVITY_STATUS_CLASS_NAMES,
} from "@/helpers/activity-helpers";
import { useTranslations } from "next-intl";

export function ActivityStatusBadge() {
  const { control } = useFormContext<CreateActivityFormValues>();
  const t = useTranslations("activities");
  const status = useWatch({ control, name: "status" });
  const priority = useWatch({ control, name: "priority" });
  return (
    <Card className={ACTIVITY_STATUS_CLASS_NAMES[status ?? "SCHEDULED"]}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t("activityStatus")}</p>
            <p className="text-xl font-bold capitalize">{t(`status.${status}`)}</p>
          </div>
          <Badge
            variant={ACTIVITY_PRIORITY_VARIANTS[priority ?? "LOW"]}
            className="text-sm px-3 py-1 border-border"
          >
            {t("form.priority")}: {t(`priority.${priority}`)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
