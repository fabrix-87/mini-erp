"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ShoppingCart,
  UserPlus,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { RecentActivityType } from "@/types/dashboard";

type ActivityType =
  | "order"
  | "customer"
  | "quote"
  | "opportunity"
  | "product"
  | "alert"
  | "payment"
  | "document"
  | "unknown";

interface RecentActivityProps {
  activities?: RecentActivityType[];
  isLoading?: boolean;
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const getActivityIcon = (type: ActivityType) => {
    const iconMap = {
      order: ShoppingCart,
      customer: UserPlus,
      quote: FileText,
      opportunity: TrendingUp,
      product: Package,
      alert: AlertCircle,
      payment: CheckCircle2,
      document: FileText,
      unknown: Clock,
    };
    return iconMap[type] || Clock;
  };

  const getActivityColor = (type: ActivityType, status?: string) => {
    if (status === "warning") return "bg-yellow-500";
    if (status === "success") return "bg-green-500";
    if (status === "info") return "bg-blue-500";

    const colorMap = {
      order: "bg-green-500",
      customer: "bg-blue-500",
      quote: "bg-purple-500",
      opportunity: "bg-yellow-500",
      product: "bg-orange-500",
      alert: "bg-red-500",
      payment: "bg-emerald-500",
      document: "bg-indigo-500",
      unknown: "bg-gray-500",
    };
    return colorMap[type] || "bg-gray-500";
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const variants = {
      success: "bg-green-50 text-green-700 border-green-200",
      warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
    };

    return (
      <Badge
        variant="outline"
        className={variants[status as keyof typeof variants]}
      >
        {status}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp?: string, relativeTime?: string) => {
    if (relativeTime) return relativeTime;
    if (!timestamp) return "Data sconosciuta";

    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: it });
    } catch (error) {
      return "Data non valida";
    }
  };

  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Attività Recenti</span>
            <Badge variant="secondary">Ultimi 24h</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Nessuna attività recente
            </p>
            <p className="text-xs text-muted-foreground">
              Le attività appariranno qui quando ci saranno nuovi eventi
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attività Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attività Recenti</span>
          <Badge variant="secondary" className="ml-auto">
            {activities.length}{" "}
            {activities.length === 1 ? "attività" : "attività"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type, activity.status);

            return (
              <div
                key={activity.id || index}
                className={cn(
                  "flex items-start gap-4 pb-4",
                  index !== activities.length - 1 && "border-b"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
                    colorClass
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">
                      {activity.title}
                    </p>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {formatTimestamp(activity.timestamp, activity.time)}
                </span>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        {activities.length >= 5 && (
          <div className="mt-4 pt-4 border-t">
            <button className="text-sm text-primary hover:underline w-full text-center">
              Vedi tutte le attività →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
