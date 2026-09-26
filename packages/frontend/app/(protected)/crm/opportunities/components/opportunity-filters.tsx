// packages/frontend/app/(protected)/crm/opportunities/components/opportunity-filters.tsx
"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { OpportunityQueryInput } from "@/types/opportunity-types";

import { getRoute } from "@/lib/navigation-routes";
import { FilterFieldConfig } from "@/types/filter-types";

import { FilterBar, FilterInitialValues } from "@/components/filter-bar";
import { getOpportunitySourceOptions, getOpportunityStageOptions, getOpportunityStatusOptions } from "@/helpers/opportunity-helper";

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
  const basePath = useMemo(() => getRoute("opportunities"), [getRoute]);

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
        options: getOpportunityStatusOptions(t, true),
      },
      {
        type: "select",
        key: "stage",
        options: getOpportunityStageOptions(t, true),
      },
      {
        type: "select",
        key: "source",
        options: getOpportunitySourceOptions(t, true),
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
