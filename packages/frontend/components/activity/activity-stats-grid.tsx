// components/activity/activity-stats-grid.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Clock,
  TrendingUp,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { ActivityStats } from "@/types/activitiy";

interface ActivityStatsGridProps {
  stats?: ActivityStats;
  isLoading?: boolean;
}

export function ActivityStatsGrid({
  stats,
  isLoading,
}: ActivityStatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calcola totali dai dati groupBy
  const totalActivities = stats.byStatus.reduce(
    (sum, item) => sum + item._count,
    0
  );
  const completedCount =
    stats.byStatus.find((s) => s.status === "COMPLETED")?._count || 0;
  const inProgressCount =
    stats.byStatus.find((s) => s.status === "IN_PROGRESS")?._count || 0;
  const scheduledCount =
    stats.byStatus.find((s) => s.status === "SCHEDULED")?._count || 0;

  const cards = [
    {
      title: "Totale",
      value: totalActivities,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      description: "Attività totali",
    },
    {
      title: "Oggi",
      value: stats.today,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      description: "Attività di oggi",
    },
    {
      title: "In Ritardo",
      value: stats.overdue,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
      description: "Attività scadute",
    },
    {
      title: "Completate",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      description: `${totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0}% del totale`,
    },
    {
      title: "In Corso",
      value: inProgressCount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      description: "In lavorazione",
    },
    {
      title: "Follow-up",
      value: stats.followUp,
      icon: RotateCcw,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      description: "Richiedono follow-up",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
            
            {/* Indicatore visivo per urgenze */}
            {card.title === "In Ritardo" && card.value > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500" />
            )}
            {card.title === "Follow-up" && card.value > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
            )}
          </Card>
        );
      })}
    </div>
  );
}
