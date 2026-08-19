"use client";

import { SupplierQueryInput, SupplierStats } from "@mini-erp/shared";
import { CompanyListStats } from "../company-list-stats";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { getRoute } from "@/lib/navigation-routes";
import { FilterFieldConfig } from "@/types/filter-types";
import { FilterBar, FilterInitialValues } from "@/components/ui/filter-bar";

interface Props {
  searchParams: SupplierQueryInput;
  stats: SupplierStats;
  onPendingChange: (isPending: boolean) => void;
}

const DEFAULT_VALUES = {
  search: "",
  minRating: "all",
};

export default function SupplierHeaderListPage({ searchParams, stats, onPendingChange }: Props) {
  const t = useTranslations("crm.suppliers");
  const basePath = useMemo(() => getRoute("suppliers"), [getRoute]);

  // ── Field config ─────────────────────────────────────────────────────────────
  const SUPPLIER_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: t("searchFilterPlaceholder"),
        debounceMs: 500,
        colSpan: 2,
      },
      {
        type: "select",
        key: "minRating",
        placeholder: t("ratingFilterPlaceholder"),
        options: [
          { label: t("ratingAll"), value: "all" },
          { label: "⭐ 1+", value: "1" },
          { label: "⭐⭐ 2+", value: "2" },
          { label: "⭐⭐⭐ 3+", value: "3" },
          { label: "⭐⭐⭐⭐ 4+", value: "4" },
          { label: "⭐⭐⭐⭐⭐ 5", value: "5" },
        ],
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: searchParams.search ?? DEFAULT_VALUES.search,
    minRating: searchParams.minRating?.toString() ?? DEFAULT_VALUES.minRating,
  };

  return (
    <>
      {/* Stats */}
      <CompanyListStats type="SUPPLIER" stats={stats} />

      {/* Filters */}
      <FilterBar
        basePath={basePath}
        defaultValues={DEFAULT_VALUES}
        fields={SUPPLIER_FILTER_FIELDS}
        initialValues={initialValues}
        onPendingChange={onPendingChange}
      />
    </>
  );
}
