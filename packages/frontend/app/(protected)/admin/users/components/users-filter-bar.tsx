"use client";

import { useMemo } from "react";
import { FilterBar, type FilterInitialValues } from "@/components/ui/filter-bar";
import { useNavigation } from "@/hooks/use-navigation";
import { FilterFieldConfig } from "@/types/filter-types";
import { useTranslations } from "next-intl";

const USER_FILTER_DEFAULTS = {
  sortBy: "createdAt",
  sortOrder: "desc",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface UsersFilterBarProps {
  initialSearch?: string;
  initialActive?: boolean | null;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  onPendingChange: (isPending: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Filter bar for the Users list page.
 * Thin wrapper around the generic FilterBar with Users-specific field config.
 */
export function UsersFilterBar({
  initialSearch = "",
  initialActive = null,
  initialSortBy = "createdAt",
  initialSortOrder = "desc",
  onPendingChange,
}: UsersFilterBarProps) {
  const { getRoute } = useNavigation();
  const basePath = useMemo(() => getRoute("users"), [getRoute]);
  const t = useTranslations("admin.users");

  // ── Field config ─────────────────────────────────────────────────────────────

  const USER_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
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
        key: "active",
        placeholder: t("activeFilterPlaceholder"),
        options: [
          { value: "all", label: t("all") },
          { value: "true", label: t("activeOnly") },
          { value: "false", label: t("inactiveOnly") },
        ],
      },
      {
        type: "sort",
        sortByKey: "sortBy",
        sortOrderKey: "sortOrder",
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
        options: [
          { value: "createdAt", label: "Data Creazione" },
          { value: "username", label: "Username" },
          { value: "email", label: "Email" },
        ],
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: initialSearch,
    active: initialActive === null ? "" : String(initialActive),
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  };

  return (
    <FilterBar
      basePath={basePath}
      fields={USER_FILTER_FIELDS}
      initialValues={initialValues}
      defaultValues={USER_FILTER_DEFAULTS}
      onPendingChange={onPendingChange}
    />
  );
}
