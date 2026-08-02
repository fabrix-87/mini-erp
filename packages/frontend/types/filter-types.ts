/** A single option for a Select filter field */
export interface FilterSelectOption {
  value: string;
  label: string;
  default?: boolean;
}

// Base config shared by all filters field
interface BaseFilterField<TType extends string = string> {
  type: TType;
  key: string;
  placeholder?: string;
  label?: string;
}

/** Config for a search (text input) field */
export interface FilterFieldSearch extends BaseFilterField<"search"> {
  /** Grid column span on sm+ screens. Default: 2 */
  colSpan?: number;
  debounceMs?: number;
}

/**
 * Config for a numeric filter field.
 */
export interface FilterNumberFieldConfig extends BaseFilterField<"number">  {
  min?: number;
  max?: number;
  step?: number | 'any';
  resetPageOnChange?: boolean;
}

/** Config for a select (dropdown) field */
export interface FilterFieldSelect extends BaseFilterField<"select">  {
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
  label?: string;
}

export type FilterFieldConfig = FilterFieldSearch | FilterFieldSelect | FilterFieldSort | FilterNumberFieldConfig;
