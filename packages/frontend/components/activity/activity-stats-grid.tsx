// app/(protected)/crm/activities/components/activity-stats-grid.tsx
import type { ReactElement } from "react";
import { AlertCircle, Calendar, CheckCircle2, Clock, RotateCcw, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { ActivityStats } from "@mini-erp/shared";

import { StatsGrid } from "../stats-grid";
import type { StatMetric } from "../stats-grid";
import { StatsGridColumns } from "@/types/stats-grid-types";

interface ActivityStatsGridProps {
  stats: ActivityStats;
}

/**
 * Displays a localized summary of activity statistics.
 * @param stats - Aggregated activity statistics.
 * @returns The activity metrics grid.
 */
export async function ActivityStatsGrid({ stats }: ActivityStatsGridProps): Promise<ReactElement> {
  const t = await getTranslations("activities.stats");

  const counts = stats.byStatus.reduce(
    (result, item) => {
      result.total += item._count;

      if (item.status === "COMPLETED") {
        result.completed += item._count;
      }

      if (item.status === "IN_PROGRESS") {
        result.inProgress += item._count;
      }

      return result;
    },
    { total: 0, completed: 0, inProgress: 0 },
  );

  const completedPercent =
    counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  const metrics: StatMetric[] = [
    {
      id: "totalActivities",
      kind: "value",
      value: counts.total,
      icon: TrendingUp,
      label: t("totalActivities"),
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      description: t("totalDescription"),
    },
    {
      id: "today",
      kind: "value",
      value: stats.today,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      label: t("today"),
      description: t("todayDescription"),
    },
    {
      id: "overdue",
      kind: "value",
      value: stats.overdue,
      icon: AlertCircle,
      tone: "danger",
      label: t("overdue"),
      description: t("overdueDescription"),
    },
    {
      id: "completed",
      kind: "value",
      value: counts.completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      label: t("completed"),
      description: t("completedDescription", {
        percent: completedPercent,
      }),
    },
    {
      id: "inProgress",
      kind: "value",
      value: counts.inProgress,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      label: t("inProgress"),
      description: t("inProgressDescription"),
    },
    {
      id: "follow-up",
      kind: "value",
      value: stats.followUp,
      icon: RotateCcw,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      label: t("followUp"),
      description: t("followUpDescription"),
    },
  ];

  return <StatsGrid metrics={metrics} ariaLabel={t("summary")} columns={StatsGridColumns.Six} />;
}
