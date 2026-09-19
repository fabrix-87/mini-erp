// components/company/company-list-stats.tsx
"use client";

import { TrendingUp, Users, DollarSign, Star, Banknote, UsersRound } from "lucide-react";
import { CustomerStats, SupplierStats } from "@mini-erp/shared";
import { formatCurrency } from "@/utils/format-currency";
import { useTranslations } from "next-intl";
import { StatMetric, StatsGrid } from "../stats-grid";
import { StatsGridColumns } from "@/types/stats-grid-types";

type CustomerListStatsProps = {
  type: "CUSTOMER";
  stats: CustomerStats;
};

type SupplierListStatsProps = {
  type: "SUPPLIER";
  stats: SupplierStats;
};

type CompanyListStatsProps = CustomerListStatsProps | SupplierListStatsProps;

function buildCustomerMetrics(
  stats: CustomerStats,
  t: ReturnType<typeof useTranslations>,
): StatMetric[] {
  return [
    {
      id: "total-customers",
      kind: "value",
      value: stats.totalCustomers,
      icon: Users,
      label: t("totalCustomers"),
    },
    {
      id: "total-revenue",
      kind: "value",
      value: formatCurrency(stats.totalRevenue),
      icon: Banknote,
      tone: "success",
      label: t("totalRevenue"),
    },
    {
      id: "average-order-value",
      kind: "value",
      value: formatCurrency(stats.averageOrderValue),
      icon: TrendingUp,
      tone: "warning",
      label: t("averageOrderValue"),
    },
    {
      id: "by-segment",
      kind: "breakdown",
      label: t("bySegment"),
      icon: UsersRound,
      tone: "primary",
      rows: Object.entries(stats.bySegment ?? {}).map(([segment, count]) => ({
        id: segment,
        label: segment,
        value: count,
      })),
      emptyLabel: t("noSegments"),
    },
  ];
}

function buildSupplierMetrics(
  stats: SupplierStats,
  t: ReturnType<typeof useTranslations>,
): StatMetric[] {
  return [
    {
      id: "total-suppliers",
      kind: "value",
      value: stats.totalSuppliers,
      icon: Users,
      label: t("totalSuppliers"),
    },
    {
      id: "total-spent",
      kind: "value",
      value: formatCurrency(stats.totalSpent),
      icon: Banknote,
      tone: "success",
      label: t("totalSpent"),
    },
    {
      id: "average-rating",
      kind: "value",
      value: `${stats.averageRating} ⭐`,
      icon: Star,
      tone: "warning",
      label: t("averageRating"),
    },
    {
      id: "by-rating",
      kind: "breakdown",
      label: t("byRating"),
      icon: UsersRound,
      tone: "primary",
      rows: Object.entries(stats.byRating)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([rating, count]) => ({
          id: rating,
          label: "⭐".repeat(parseInt(rating)),
          value: count,
        })),
      emptyLabel: t("noRating"),
    },
  ];
}

export function CompanyListStats({ type, stats }: CompanyListStatsProps) {
  const t = useTranslations(type === "CUSTOMER" ? "crm.customers.stats" : "crm.suppliers.stats");

  return (
    <StatsGrid
      metrics={
        type === "CUSTOMER" ? buildCustomerMetrics(stats, t) : buildSupplierMetrics(stats, t)
      }
      ariaLabel={t("summary")}
      columns={StatsGridColumns.Four}
    />
  );
}
