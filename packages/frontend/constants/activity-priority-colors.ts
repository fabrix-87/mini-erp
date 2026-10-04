import { ActivityPriority, ActivityStatus, ActivityType } from "@mini-erp/shared";

import {
  Phone,
  Mail,
  Users,
  Video,
  MapPin,
  FileText,
  MessageSquare,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export const ActivityTypeIcons = {
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
} as const satisfies Record<ActivityType, LucideIcon>;

/** Maps activity types to neutral icon colors. */
/*
export const ActivityTypeColors = {
  CALL: "border-border text-muted-foreground",
  EMAIL: "border-border text-muted-foreground",
  MEETING: "border-border text-muted-foreground",
  TASK: "border-border text-muted-foreground",
  NOTE: "border-border text-muted-foreground",
  WHATSAPP: "border-border text-muted-foreground",
  SMS: "border-border text-muted-foreground",
  VIDEO_CALL: "border-border text-muted-foreground",
  SITE_VISIT: "border-border text-muted-foreground",
  OTHER: "border-border text-muted-foreground",
} as const satisfies Record<ActivityType, string>;
*/
export const ActivityTypeColors = "border-border text-muted-foreground";

/** Maps activity statuses to a subtle accent border and badge colors. */
export const ActivityStatusColors = {
  SCHEDULED: {
    border: "border-border",
    accentBorder: "border-l-4 border-l-amber-400 dark:border-l-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/10",
  },
  IN_PROGRESS: {
    border: "border-border",
    accentBorder: "border-l-4 border-l-blue-500 dark:border-l-blue-400",
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-500/10",
  },
  COMPLETED: {
    border: "border-border",
    accentBorder: "border-l-4 border-l-emerald-500 dark:border-l-emerald-400",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10",
  },
  CANCELLED: {
    border: "border-border",
    accentBorder: "border-l-4 border-l-red-500 dark:border-l-red-400",
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-500/10",
  },
  RESCHEDULED: {
    border: "border-border",
    accentBorder: "border-l-4 border-l-violet-500 dark:border-l-violet-400",
    text: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-500/10",
  },
  NO_SHOW: {
    border: "border-border",
    accentBorder: "border-l-4 border-l-slate-400 dark:border-l-slate-500",
    text: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-500/10",
  },
} as const satisfies Record<
  ActivityStatus,
  {
    border: string;
    accentBorder: string;
    text: string;
    bg: string;
  }
>;

/** Maps activity priorities to badge colors. */
export const ActivityPriorityColors = {
  LOW: {
    border: "border-gray-200 dark:border-gray-700",
    text: "text-gray-700 dark:text-gray-300",
    bg: "bg-gray-100 dark:bg-gray-800",
  },
  MEDIUM: {
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  HIGH: {
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-950",
  },
  URGENT: {
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950",
  },
} as const satisfies Record<ActivityPriority, { border: string; text: string; bg: string }>;
