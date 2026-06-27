"use client";

import { FilterBar, type FilterInitialValues } from "@/components/ui/filter-bar";
import { useNavigation } from "@/hooks/use-navigation";
import { FilterFieldConfig } from "@/types/filter-types";
import { LANGUAGE_SORT_FIELDS } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const LANGUAGE_FILTER_DEFAULTS = {
  sortBy: "id",
  sortOrder: "asc" as "asc" | "desc",
};

interface Props {
  initialSearch?: string;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  onPendingChange: (isPending: boolean) => void;
}

export function LanguageFilterBar({
  initialSearch = "",
  initialSortBy = LANGUAGE_FILTER_DEFAULTS.sortBy,
  initialSortOrder = LANGUAGE_FILTER_DEFAULTS.sortOrder,
  onPendingChange,
}: Props) {
  const { getRoute, navigateToNew } = useNavigation();
  const basePath = useMemo(() => getRoute("localization"), [getRoute]);

  const t = useTranslations("system");

  // ── Field config ─────────────────────────────────────────────────────────────

  const fields: FilterFieldConfig[] = useMemo(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: t("localization.searchPlaceholder"),
        debounceMs: 500,
        colSpan: 2,
      },
      {
        type: "sort",
        sortByKey: "sortBy",
        sortOrderKey: "sortOrder",
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
        options: Array.from(LANGUAGE_SORT_FIELDS).map((field) => ({
          value: field as string,
          label: t(`localization.${field}`),
        })),
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: initialSearch,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  };

  return (
    <FilterBar
      basePath={basePath}
      fields={fields}
      onPendingChange={onPendingChange}
      defaultValues={LANGUAGE_FILTER_DEFAULTS}
      initialValues={initialValues}
    />
  );
}
