"use client";

import { CustomerQueryInput, CustomerStats } from "@mini-erp/shared";
import { CompanyListStats } from "../company-list-stats";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { getRoute } from "@/lib/navigation-routes";
import { FilterFieldConfig } from "@/types/filter-types";
import { FilterBar, FilterInitialValues } from "@/components/filter-bar";
import { getCustomerSegmentOptions, getCustomerTypeOptions } from "@/helpers/customer-helper";

interface Props {
  searchParams: CustomerQueryInput;
  stats: CustomerStats;
  onPendingChange: (isPending: boolean) => void;
}

const DEFAULT_VALUES = {
  search: "",
  type: "ALL",
  segment: "ALL",
};

export default function CustomerHeaderListPage({ searchParams, stats, onPendingChange }: Props) {
  const t = useTranslations("crm.customers");
  const basePath = useMemo(() => getRoute("customers"), [getRoute]);

  // ── Field config ─────────────────────────────────────────────────────────────
  const CUSTOMER_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
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
        key: "type",
        placeholder: t("type"),
        options: getCustomerTypeOptions(t, true),
      },
      {
        type: "select",
        key: "segment",
        placeholder: t("segment"),
        options: getCustomerSegmentOptions(t, true),
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: searchParams.search ?? DEFAULT_VALUES.search,
    type: searchParams.type ?? DEFAULT_VALUES.type,
    segment: searchParams.segment ?? DEFAULT_VALUES.segment,
  };

  return (
    <>
      {/* Stats */}
      <CompanyListStats type="CUSTOMER" stats={stats} />

      {/* Filters */}
      <FilterBar
        basePath={basePath}
        defaultValues={DEFAULT_VALUES}
        fields={CUSTOMER_FILTER_FIELDS}
        initialValues={initialValues}
        onPendingChange={onPendingChange}
      />
    </>
  );
}
