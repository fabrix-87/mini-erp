// packages/frontend/app/(protected)/crm/opportunities/components/opportunity-filters.tsx
"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { OpportunityQueryInput } from "@/types/opportunity-types";

import { getRoute } from "@/lib/navigation-routes";
import { FilterFieldConfig } from "@/types/filter-types";
import { getStageOptions, getStatusOptions, getSourceOptions } from "@/helpers/opportunity-helper";
import { FilterBar, FilterInitialValues } from "@/components/ui/filter-bar";

interface OpportunityFiltersProps {
  searchParams: OpportunityQueryInput;
  onPendingChange: (pending: boolean) => void;
}

const DEFAULT_VALUES = {
  search: "",
  status: "ALL",
  stage: "ALL",
  source: "ALL",
};

/**
 * Compact filter toolbar for opportunities.
 * Synchronizes search and select filters with URL query params.
 */
export function OpportunityFilters({
  searchParams,
  onPendingChange,
}: OpportunityFiltersProps): React.ReactElement {
  const t = useTranslations("crm.opportunities");
  const basePath = useMemo(() => getRoute("opportunity"), [getRoute]);

  const OPPORTUNITY_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: t("filters.searchPlaceholder"),
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
        key: "stage",
        options: getStageOptions(t),
      },
      {
        type: "select",
        key: "source",
        options: getSourceOptions(t),
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: searchParams.search ?? DEFAULT_VALUES.search,
    status: searchParams.status ?? DEFAULT_VALUES.status,
    source: searchParams.source ?? DEFAULT_VALUES.source,
    stage: searchParams.stage ?? DEFAULT_VALUES.stage,
  };

  return (
    <FilterBar
      basePath={basePath}
      defaultValues={DEFAULT_VALUES}
      fields={OPPORTUNITY_FILTER_FIELDS}
      initialValues={initialValues}
      onPendingChange={onPendingChange}
    />
  );
}
