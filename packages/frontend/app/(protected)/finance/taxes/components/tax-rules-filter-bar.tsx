"use client";

import { FilterBar, FilterInitialValues } from "@/components/ui/filter-bar";
import { useNavigation } from "@/hooks/use-navigation";
import { FilterFieldConfig } from "@/types/filter-types";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const TAX_RULES_FILTER_DEFAULTS = {
  sortBy: "displayOrder",
  sortOrder: "asc" as "asc" | "desc",
};

interface Props {
  initialSearch?: string;
  initialActive?: boolean | null;
  initialApplicableFor?: string;
  initialMinRate: string;
  initialMaxRate: string;
  canCreate: boolean;
  onPendingChange: (isPending: boolean) => void;
}

export function TaxesFilterBar({
  initialSearch = "",
  initialActive = null,
  initialApplicableFor = "",
  initialMinRate = "",
  initialMaxRate = "",
  canCreate = false,
  onPendingChange,
}: Props) {
  const { getRoute, navigateToNew } = useNavigation();
  const basePath = useMemo(() => getRoute("taxes"), [getRoute]);

  const t = useTranslations("finance.taxes");

  // ── Field config ─────────────────────────────────────────────────────────────

  const fields = useMemo<FilterFieldConfig[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: t("placeholder.search"),
        debounceMs: 500,
        colSpan: 1,
      },
      {
        type: "select",
        key: "applicableFor",
        placeholder: t("placeholder.applicableFor"),
        options: [
          { value: "all", label: t("applicableFor.all") },
          { value: "SALES", label: t("applicableFor.sales") },
          { value: "PURCHASES", label: t("applicableFor.purchases") },
          { value: "BOTH", label: t("applicableFor.both") },
        ],
      },
      {
        type: "number",
        key: "minRate",
        placeholder: t("placeholder.minRate"),
        min: 0,
        max: 100,
        step: 0.01,
      },
      {
        type: "number",
        key: "maxRate",
        placeholder: t("placeholder.maxRate"),
        min: 0,
        max: 100,
        step: 0.01,
      },
      {
        type: "select",
        key: "active",
        placeholder: t("placeholder.active"),
        options: [
          { value: "all", label: t("active.all") },
          { value: "true", label: t("active.enabled") },
          { value: "false", label: t("active.disabled") },
        ],
      },
    ],
    [t],
  );

  const handleNewClick = () => {
    navigateToNew("taxes");
  };

  const initialValues: FilterInitialValues = useMemo(
    () => ({
      search: initialSearch,
      applicableFor: initialApplicableFor,
      minRate: initialMinRate,
      maxRate: initialMaxRate,
      active: initialActive === null ? "" : String(initialActive),
    }),
    [initialSearch, initialApplicableFor, initialMinRate, initialMaxRate, initialActive],
  );

  return (
    <FilterBar
      basePath={basePath}
      fields={fields}
      onPendingChange={onPendingChange}
      defaultValues={TAX_RULES_FILTER_DEFAULTS}
      initialValues={initialValues}
      canCreate={canCreate}
      handleNewClick={handleNewClick}
      newButtonText={t("createNewButton")}
    />
  );
}
