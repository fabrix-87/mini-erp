// app/components/activities/activity-card.tsx
"use client";

import {
  Phone,
  Mail,
  Users,
  Video,
  MapPin,
  FileText,
  Clock,
  AlertCircle,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Activity } from "@/types/activitiy";
import { cn } from "@/lib/utils";
import { formatDateIT } from "@/helpers/date-helper";

const activityTypeIcons: Record<string, any> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: FileText,
  NOTE: FileText,
  WHATSAPP: MessageSquare,
  SMS: Smartphone,
  VIDEO_CALL: Video,
  SITE_VISIT: MapPin,
  OTHER: FileText,
};

const activityTypeColors: Record<string, string> = {
  CALL: "bg-blue-500/10 text-blue-700",
  EMAIL: "bg-purple-500/10 text-purple-700",
  MEETING: "bg-green-500/10 text-green-700",
  TASK: "bg-orange-500/10 text-orange-700",
  NOTE: "bg-gray-500/10 text-gray-700",
  WHATSAPP: "bg-green-600/10 text-green-800",
  SMS: "bg-indigo-500/10 text-indigo-700",
  VIDEO_CALL: "bg-pink-500/10 text-pink-700",
  SITE_VISIT: "bg-cyan-500/10 text-cyan-700",
  OTHER: "bg-gray-500/10 text-gray-700",
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-yellow-500/10 text-yellow-700",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700",
  COMPLETED: "bg-green-500/10 text-green-700",
  CANCELLED: "bg-red-500/10 text-red-700",
  RESCHEDULED: "bg-orange-500/10 text-orange-700",
  NO_SHOW: "bg-gray-500/10 text-gray-700",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Programmata",
  IN_PROGRESS: "In corso",
  COMPLETED: "Completata",
  CANCELLED: "Annullata",
  RESCHEDULED: "Riprogrammata",
  NO_SHOW: "Non presentato",
};

const priorityColors: Record<string, string> = {
  LOW: "border-gray-300",
  MEDIUM: "border-blue-500",
  HIGH: "border-orange-500",
  URGENT: "border-red-500",
};

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
  const Icon = activityTypeIcons[activity.type] || FileText;
  
  const isOverdue =
    activity.status === "SCHEDULED" &&
    new Date(activity.scheduledStart) < new Date();

  const datetime = formatDateIT(activity.scheduledStart);

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 border-l-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
        priorityColors[activity.priority],
        isOverdue && "bg-red-500/5"
      )}
      onClick={onClick}
    >
      {/* Icon & Date */}
      <div className="flex flex-col items-center gap-1 min-w-15">
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            activityTypeColors[activity.type]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-xs font-medium text-center">{datetime}</div>
        <div className="text-xs text-muted-foreground">{datetime}</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-medium truncate">{activity.subject}</div>
          <div className="flex gap-2 shrink-0">
            <Badge variant="secondary" className={statusColors[activity.status]}>
              {statusLabels[activity.status] || activity.status}
            </Badge>
            {activity.priority === "HIGH" && (
              <Badge variant="outline" className="border-orange-500 text-orange-700">
                Alta
              </Badge>
            )}
            {activity.priority === "URGENT" && (
              <Badge variant="outline" className="border-red-500 text-red-700">
                Urgente
              </Badge>
            )}
          </div>
        </div>

        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm">
          {activity.customer && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="truncate max-w-50">
                {activity.customer.company.companyName}
              </span>
            </div>
          )}

          {activity.lead && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="truncate max-w-50">
                {activity.lead.companyName}
              </span>
            </div>
          )}

          {activity.contact && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              •
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
              {activity.duration}min
            </div>
          )}

          {isOverdue && (
            <div className="flex items-center gap-1.5 text-red-600 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              In ritardo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
