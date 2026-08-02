"use client";

import { useMemo } from "react";
import { ContactQueryInput } from "@mini-erp/shared";
import { useNavigation } from "@/hooks/use-navigation";
import { useTranslations } from "next-intl";
import { FilterFieldConfig } from "@/types/filter-types";
import { FilterBar, FilterInitialValues } from "@/components/ui/filter-bar";

interface ContactToolbarProps {
  filters: ContactQueryInput;
  onExport: (params: ContactQueryInput) => Promise<void>;
  isExporting: boolean;
  canCreate: boolean;
  onPendingChange: (isPending: boolean) => void;
}

const DEFAULT_VALUES = {
  search: "",
  active: "all",
  department: "",
  isPrimaryContact: "all",
};

export default function ContactFilterBar({
  filters,
  onExport,
  isExporting,
  canCreate = false,
  onPendingChange,
}: ContactToolbarProps) {
  const { getRoute, navigateToNew } = useNavigation();
  const basePath = useMemo(() => getRoute("contacts"), [getRoute]);
  const t = useTranslations("crm.contacts");

  // ── Field config ─────────────────────────────────────────────────────────────
  const CONTACT_FILTER_FIELDS = useMemo<FilterFieldConfig[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: t("searchFilterPlaceholder"),
        label: t("searchFilterPlaceholder"),
        debounceMs: 500,
        colSpan: 2,
      },
      {
        type: "select",
        key: "active",
        placeholder: t("activeFilterPlaceholder"),
        label: t("activeFilterPlaceholder"),
        options: [
          { value: "all", label: t("all") },
          { value: "true", label: t("active") },
          { value: "false", label: t("inactive") },
        ],
      },
      {
        type: "select",
        key: "isPrimaryContact",
        placeholder: t("contact_type"),
        label: t("contact_type"),
        options: [
          { value: "all", label: t("all") },
          { value: "true", label: t("primary") },
          { value: "false", label: t("secondary") },
        ],
      },
      {
        type: "search",
        key: "department",
        placeholder: t("departmentFilterPlaceholder"),
        label: t("departmentFilterPlaceholder"),
        debounceMs: 500,
      },
    ],
    [t],
  );

  const initialValues: FilterInitialValues = {
    search: filters.search ?? DEFAULT_VALUES.search,
    active: filters.active != null ? String(filters.active) : DEFAULT_VALUES.active,
    department: filters.department ?? DEFAULT_VALUES.department,
    isPrimaryContact:
      filters.isPrimaryContact != null
        ? String(filters.isPrimaryContact)
        : DEFAULT_VALUES.isPrimaryContact,
  };

  const handleNewClick = () => {
    navigateToNew("contacts");
  };

  return (
    <FilterBar
      basePath={basePath}
      defaultValues={DEFAULT_VALUES}
      fields={CONTACT_FILTER_FIELDS}
      initialValues={initialValues}
      canCreate={canCreate}
      handleNewClick={handleNewClick}
      newButtonText={t("createNewButton")}
      onPendingChange={onPendingChange}
    />
  );
}
