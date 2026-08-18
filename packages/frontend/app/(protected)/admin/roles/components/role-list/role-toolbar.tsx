"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FilterFieldConfig } from "@/types/filter-types";
import { FilterBar, FilterInitialValues } from "@/components/ui/filter-bar";
import { getRoute } from "@/lib/navigation-routes";

interface RoleToolbarProps {
  initialSearch: string;
  onPendingChange: (isPending: boolean) => void;
}

const DEFAULT_VALUES = {
  search: "",
};

export default function RoleToolbar({ initialSearch, onPendingChange }: RoleToolbarProps) {
  const t = useTranslations("admin.roles");
  const basePath = useMemo(() => getRoute("roles"), [getRoute]);

  // ── Field config ─────────────────────────────────────────────────────────────
  const CONTACT_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: t("searchFilterPlaceholder"),
        debounceMs: 500,
        colSpan: 2,
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: initialSearch ?? DEFAULT_VALUES.search,
  };

  return (
    <FilterBar
      basePath={basePath}
      defaultValues={DEFAULT_VALUES}
      fields={CONTACT_FILTER_FIELDS}
      initialValues={initialValues}
      onPendingChange={onPendingChange}
    />
  );
}
