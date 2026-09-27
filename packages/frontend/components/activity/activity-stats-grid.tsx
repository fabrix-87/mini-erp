// components/activity/activity-stats-grid.tsx
import { Calendar, AlertCircle, CheckCircle2, RotateCcw, Clock, TrendingUp } from "lucide-react";
import { StatMetric, StatsGrid } from "../stats-grid";
import { ActivityStats } from "@mini-erp/shared";
import { getTranslations } from "next-intl/server";
import { createTranslator } from "next-intl";
import { StatsGridColumns } from "@/types/stats-grid-types";

function buildActivityMetrics(
  stats: ActivityStats,
  t: ReturnType<typeof createTranslator>,
): StatMetric[] {
  const totalActivities = stats.byStatus.reduce((sum, item) => sum + item._count, 0);
  const completedCount = stats.byStatus.find((s) => s.status === "COMPLETED")?._count || 0;
  const inProgressCount = stats.byStatus.find((s) => s.status === "IN_PROGRESS")?._count || 0;
  //const scheduledCount = stats.byStatus.find((s) => s.status === "SCHEDULED")?._count || 0;
  return [
    {
      id: "totalActivities",
      kind: "value",
      value: totalActivities,
      icon: TrendingUp,
      label: t("totalActivities"),
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      description: t("totalDescription"),
    },
    {
      id: "today",
      value: stats.today,
      kind: "value",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      description: t("todayDescription"),
      label: t("today"),
    },
    {
      id: "overdue",
      kind: "value",
      value: stats.overdue,
      icon: AlertCircle,
      tone: "danger",
      description: t("overdueDescription"),
      label: t("overdue"),
    },
    {
      id: "completed",
      kind: "value",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      label: t("completed"),
      description: t("completedDescription", {
        percent: totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0,
      }),
    },
    {
      id: "inProgress",
      kind: "value",
      label: t("inProgress"),
      value: inProgressCount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      description: t("inProgressDescription"),
    },
    {
      id: "follow-up",
      kind: "value",
      label: t("followUp"),
      value: stats.followUp,
      icon: RotateCcw,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      description: t("followUpDescription"),
    },
  ];
}

interface ActivityStatsGridProps {
  stats: ActivityStats;
}

export async function ActivityStatsGrid({ stats }: ActivityStatsGridProps) {
  const t = await getTranslations("activities.stats");
  return (
    <StatsGrid
      metrics={buildActivityMetrics(stats, t)}
      ariaLabel={t("summary")}
      columns={StatsGridColumns.Six}
    />
  );
}
