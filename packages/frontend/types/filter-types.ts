/** A single option for a Select filter field */
export interface FilterSelectOption {
  value: string;
  label: string;
}

/** Config for a search (text input) field */
export interface FilterFieldSearch {
  type: "search";
  key: string;
  placeholder?: string;
  /** Grid column span on sm+ screens. Default: 2 */
  colSpan?: number;
  debounceMs?: number;
}

/** Config for a select (dropdown) field */
export interface FilterFieldSelect {
  type: "select";
  key: string;
  placeholder?: string;
  options: FilterSelectOption[];
}

/** Config for sort field + sort order (paired selects) */
export interface FilterFieldSort {
  type: "sort";
  sortByKey: string;
  sortOrderKey: string;
  options: FilterSelectOption[];
  defaultSortBy: string;
  defaultSortOrder: "asc" | "desc";
}

export type FilterFieldConfig = FilterFieldSearch | FilterFieldSelect | FilterFieldSort;
