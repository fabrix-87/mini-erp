"use client";

import { FilterBar, FilterInitialValues } from "@/components/filter-bar";
import { getRoute } from "@/lib/navigation-routes";
import { FilterFieldConfig } from "@/types/filter-types";
import { WAREHOUSE_TYPES, WarehouseQueryInput } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface WarehouseFiltersProps {
  searchParams: WarehouseQueryInput;
  onPendingChange: (pending: boolean) => void;
}

const DEFAULT_VALUES = {
  search: "",
  type: "ALL",
  active: "ALL",
};

export function WarehouseFilters({ searchParams, onPendingChange }: WarehouseFiltersProps) {
  const t = useTranslations("warehouse");
  const basePath = useMemo(() => getRoute("warehouses"), [getRoute]);

  const FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
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
        key: "type",
        options: [
          {
            label: t("types.ALL"),
            value: "ALL",
            default: true,
          },
          ...Object.values(WAREHOUSE_TYPES).map((type) => ({
            label: t(`types.${type}`),
            value: type,
          })),
        ],
      },
      {
        type: "select",
        key: "active",
        options: [
          {
            label: t("active.ALL"),
            value: "ALL",
            default: true,
          },
          {
            label: t("active.enable"),
            value: "true",
          },
          {
            label: t("active.disabled"),
            value: "false",
          },
        ],
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: searchParams.search ?? DEFAULT_VALUES.search,
    active: searchParams.active ? String(searchParams.active) : DEFAULT_VALUES.active,
    type: searchParams.type || DEFAULT_VALUES.type,
  };

  return (
    <FilterBar
      basePath={basePath}
      defaultValues={DEFAULT_VALUES}
      fields={FILTER_FIELDS}
      initialValues={initialValues}
      onPendingChange={onPendingChange}
    />
  );
}
