// components/leads/lead-filters.tsx
"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { getRoute } from "@/lib/navigation-routes";
import { LeadQueryInput } from "@mini-erp/shared";
import { FilterFieldConfig } from "@/types/filter-types";
import { FilterBar, FilterInitialValues } from "../../../../../components/ui/filter-bar";
import { getQualityOptions, getSourceOptions, getStatusOptions } from "@/helpers/lead-helper";

// ============================================================================
// Component
// ============================================================================

interface Props {
  searchParams: LeadQueryInput;
  onPendingChange: (isPending: boolean) => void;
}

const DEFAULT_VALUES = {
  search: "",
  status: "ALL",
  source: "ALL",
  quality: "ALL",
};

/**
 * Lead list filters — search, status, source, quality.
 */
export function LeadFilters({ searchParams, onPendingChange }: Props) {
  const basePath = useMemo(() => getRoute("leads"), [getRoute]);
  const t = useTranslations("crm.leads");

  const LEAD_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
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
        key: "status",
        options: getStatusOptions(t),
      },
      {
        type: "select",
        key: "source",
        options: getSourceOptions(t),
      },
      {
        type: "select",
        key: "quality",
        options: getQualityOptions(t),
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: searchParams.search ?? DEFAULT_VALUES.search,
    status: searchParams.status ?? DEFAULT_VALUES.status,
    source: searchParams.source ?? DEFAULT_VALUES.source,
    quality: searchParams.quality ?? DEFAULT_VALUES.quality,
  };

  return (
    <FilterBar
      basePath={basePath}
      defaultValues={DEFAULT_VALUES}
      fields={LEAD_FILTER_FIELDS}
      initialValues={initialValues}
      onPendingChange={onPendingChange}
    />
  );
}
