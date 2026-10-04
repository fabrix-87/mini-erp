// app/components/activities/activity-card.tsx
"use client";

import { Users, MapPin, FileText, Clock, AlertCircle, Building2, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Activity } from "@/types/activitiy-types";
import { cn } from "@/lib/utils";
import { formatDateIT } from "@/helpers/date-helper";
import { useTranslations } from "next-intl";
import {
  ActivityPriorityColors,
  ActivityStatusColors,
  ActivityTypeColors,
  ActivityTypeIcons,
} from "@/constants/activity-priority-colors";

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
  className?: string;
}

export function ActivityCard({ activity, onClick, className }: ActivityCardProps) {
  const Icon = ActivityTypeIcons[activity.type] || FileText;
  const priorityColor = ActivityPriorityColors[activity.priority];
  const statusColor = ActivityStatusColors[activity.status];

  const t = useTranslations("activities");

  const isOverdue =
    activity.status === "SCHEDULED" && new Date(activity.scheduledStart) < new Date();

  const datetime = formatDateIT(activity.scheduledStart);

  return (
    <div
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
        statusColor.border,
        statusColor.accentBorder,
        className,
        isOverdue && "bg-red-500/5",
      )}
      onClick={onClick}
    >
      {/* Icon & Date */}
      <div className="flex flex-col items-center gap-1 min-w-30">
        <div
          className={cn(
            ActivityTypeColors,
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-xs font-medium text-center">{datetime}</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-medium truncate">{activity.subject}</div>
          <div className="flex gap-2 shrink-0">
            <Badge variant="outline" className={cn(statusColor.text, statusColor.bg)}>
              {t(`status.${activity.status}`)}
            </Badge>
            <Badge
              variant="outline"
              className={cn(priorityColor.border, priorityColor.text, priorityColor.bg)}
            >
              {`${t("form.priority")}: ${t(`priority.${activity.priority}`)}`}
            </Badge>
          </div>
        </div>

        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{activity.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm">
          {activity.customer && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate max-w-50">{activity.customer.company.companyName}</span>
            </div>
          )}

          {activity.lead && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building className="h-3.5 w-3.5" />
              <span className="truncate max-w-50">{activity.lead.companyName}</span>
            </div>
          )}

          {activity.contact && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              •
              <Users className="h-3.5 w-3.5" />
              <span className="truncate">
                {activity.contact.firstName} {activity.contact.lastName}
              </span>
            </div>
          )}

          {activity.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-37.5">{activity.location}</span>
            </div>
          )}

          {activity.duration && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("form.duration")}: {activity.duration}
            </div>
          )}

          {isOverdue && (
            <div className="flex items-center gap-1.5 text-red-600 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              {t("isOverdue")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
