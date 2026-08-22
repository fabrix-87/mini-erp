"use client";

import { FilterBar, FilterInitialValues } from "@/components/ui/filter-bar";
import { useNavigation } from "@/hooks/use-navigation";
import { FilterFieldConfig } from "@/types/filter-types";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const TAX_RULES_DEFAULTS = {
  applicableFor: 'all',
  minRate: '0',
  maxRate: '100',
  active: "all",
  sortBy: "displayOrder",
  sortOrder: "asc" as "asc" | "desc",
};

interface Props {
  initialSearch?: string;
  initialActive?: boolean | null;
  initialApplicableFor?: string;
  initialMinRate: string;
  initialMaxRate: string;
  onPendingChange: (isPending: boolean) => void;
}

export function TaxesFilterBar({
  initialSearch = "",
  initialActive = null,
  initialApplicableFor = "",
  initialMinRate = "",
  initialMaxRate = "",
  onPendingChange,
}: Props) {
  const { getRoute } = useNavigation();
  const basePath = useMemo(() => getRoute("taxes"), [getRoute]);

  const t = useTranslations("finance.taxes");

  // ── Field config ─────────────────────────────────────────────────────────────

  const fields = useMemo<FilterFieldConfig[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: t("placeholder.search"),
        label: t("placeholder.search"),
        debounceMs: 500,
        colSpan: 2,
      },
      {
        type: "select",
        key: "applicableFor",
        label: t("placeholder.applicableFor"),
        options: [
          { value: "all", label: t("applicableFor.all"), default: true },
          { value: "SALES", label: t("applicableFor.sales") },
          { value: "PURCHASES", label: t("applicableFor.purchases") },
          { value: "BOTH", label: t("applicableFor.both") },
        ],
      },
      {
        type: "number",
        key: "minRate",        
        label: t("placeholder.minRate"),
        min: 0,
        max: 100,
        step: 0.01,
      },
      {
        type: "number",
        key: "maxRate",
        label: t("placeholder.maxRate"),
        min: 0,
        max: 100,
        step: 0.01,
      },
      {
        type: "select",
        key: "active",
        label: t("placeholder.active"),
        options: [
          { value: "all", label: t("active.all"), default: true },
          { value: "true", label: t("active.enabled") },
          { value: "false", label: t("active.disabled") },
        ],
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = useMemo(
    () => ({
      search: initialSearch,
      applicableFor: initialApplicableFor || 'all',
      minRate: initialMinRate || '0',
      maxRate: initialMaxRate || '100',
      active: initialActive === null ? "all" : String(initialActive),
    }),
    [initialSearch, initialApplicableFor, initialMinRate, initialMaxRate, initialActive],
  );

  return (
    <FilterBar
      basePath={basePath}
      fields={fields}
      onPendingChange={onPendingChange}
      defaultValues={TAX_RULES_DEFAULTS}
      initialValues={initialValues}
    />
  );
}
