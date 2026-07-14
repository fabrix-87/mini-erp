import { FilterBar, type FilterInitialValues } from "@/components/ui/filter-bar";
import { useNavigation } from "@/hooks/use-navigation";
import { currencySortLabels } from "@/types/currency-types";
import { FilterFieldConfig } from "@/types/filter-types";
import { CURRENCY_SORT_FIELDS } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const CURRENCY_FILTER_DEFAULTS = {
  sortBy: "priority",
  sortOrder: "asc" as "asc" | "desc",
};

interface Props {
  initialSearch?: string;
  initialActive?: boolean | null;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  canCreate: boolean;
  onPendingChange: (isPending: boolean) => void;
}

export function CurrenciesFilterBar({
  initialSearch = "",
  initialActive = null,
  initialSortBy = CURRENCY_FILTER_DEFAULTS.sortBy,
  initialSortOrder = CURRENCY_FILTER_DEFAULTS.sortOrder,
  canCreate = false,
  onPendingChange,
}: Props) {
  const { getRoute, navigateToNew } = useNavigation();
  const basePath = useMemo(() => getRoute("currencies"), [getRoute]);

  const t = useTranslations("system.currencies");

  // ── Field config ─────────────────────────────────────────────────────────────

  const CURRENCY_FILTER_FIELDS: FilterFieldConfig[] = [
    {
      type: "search",
      key: "search",
      placeholder: t("searchPlaceholder"),
      debounceMs: 500,
      colSpan: 2,
    },
    {
      type: "select",
      key: "active",
      placeholder: t("activeFilterPlaceholder"),
      options: [
        { value: "all", label: t("activeFilterAll") },
        { value: "true", label: t("activeFilterEnabled") },
        { value: "false", label: t("activeFilterDisabled") },
      ],
    },
    {
      type: "select",
      key: "isBaseCurrency",
      placeholder: t("baseCurrencyPlaceholder"),
      options: [
        { value: "all", label: t("all") },
        { value: "true", label: t("onlyBase") },
        { value: "false", label: t("onlyNotBase") },
      ],
    },
    {
      type: "sort",
      sortByKey: "sortBy",
      sortOrderKey: "sortOrder",
      defaultSortBy: "createdAt",
      defaultSortOrder: "desc",
      options: Array.from(CURRENCY_SORT_FIELDS).map((field) => ({
        value: field as string,
        label: currencySortLabels[field],
      })),
    },
  ];

  const handleNewClick = () => {
    navigateToNew("currencies");
  };

  const initialValues: FilterInitialValues = {
    search: initialSearch,
    active: initialActive === null ? "" : String(initialActive),
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  };

  return (
    <FilterBar
      basePath={basePath}
      fields={CURRENCY_FILTER_FIELDS}
      onPendingChange={onPendingChange}
      defaultValues={CURRENCY_FILTER_DEFAULTS}
      initialValues={initialValues}
      canCreate={canCreate}
      handleNewClick={handleNewClick}
      newButtonText={t("createNewButton")}
    />
  );
}
