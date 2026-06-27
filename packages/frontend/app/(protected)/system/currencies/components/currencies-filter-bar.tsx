import { FilterBar, type FilterInitialValues } from "@/components/ui/filter-bar";
import { useNavigation } from "@/hooks/use-navigation";
import { currencySortLabels } from "@/types/currency-types";
import { FilterFieldConfig } from "@/types/filter-types";
import { CURRENCY_SORT_FIELDS } from "@mini-erp/shared";
import { useMemo } from "react";

// ── Field config ─────────────────────────────────────────────────────────────

const CURRENCY_FILTER_FIELDS: FilterFieldConfig[] = [
  {
    type: "search",
    key: "search",
    placeholder: "Cerca per nome, simbolo o codice...",
    debounceMs: 500,
    colSpan: 2,
  },
  {
    type: "select",
    key: "active",
    placeholder: "Tutti gli stati",
    options: [
      { value: "all", label: "Tutti gli stati" },
      { value: "true", label: "Solo Attivi" },
      { value: "false", label: "Solo Inattivi" },
    ],
  },
  {
    type: "select",
    key: "isBaseCurrency",
    placeholder: "Valuta base",
    options: [
      { value: "all", label: "Tutti" },
      { value: "true", label: "Solo base" },
      { value: "false", label: "Solo non base" },
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
      newButtonText="Aggiungi nuova valuta"
    />
  );
}
