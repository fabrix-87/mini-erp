// hooks/use-async-combobox.ts
"use client";

import * as React from "react";
import { debounce } from "@/lib/utils";
import type { ComboboxOption } from "@/components/ui/combobox";

export interface UseAsyncComboboxOptions<TData> {
  /**
   * Domain fetch hook invoked with the current debounced search term.
   * Must follow the TanStack Query signature `{ data, isLoading }`.
   */
  useFetch: (params: { search: string }) => {
    data: TData | undefined;
    isLoading: boolean;
  };
  /**
   * Pure mapper from raw API response to `ComboboxOption[]`.
   * Define outside the component (or wrap in `useCallback`) to avoid
   * unnecessary re-renders — `toOptions` is intentionally excluded
   * from the `useMemo` dep array for this reason.
   */
  toOptions: (data: TData) => ComboboxOption[];
  /** Debounce delay in milliseconds. Defaults to 300. */
  debounceMs?: number;
}

export interface UseAsyncComboboxResult {
  /** Derived options ready to be passed to `<Combobox options={...} />`. */
  options: ComboboxOption[];
  /** Loading state forwarded from the domain hook. */
  isLoading: boolean;
  /**
   * Debounced search handler — pass directly to `<Combobox onSearchChange={...} />`.
   * Already memoised; do not wrap again.
   */
  onSearchChange: (search: string) => void;
  /** Debounced search term corrente — utile per la "selected query" di ripristino label. */
  debouncedSearch: string;
}

/**
 * Encapsulates debounced search state and option derivation for async comboboxes.
 *
 * @example
 * const { options, isLoading, onSearchChange } = useAsyncCombobox({
 *   useFetch: ({ search }) => useCountries({ page: 1, limit: 10, search }),
 *   toOptions: (data) => data.data.map((c) => ({ value: c.code, label: c.name })),
 * });
 *
 * @param options.useFetch   - Domain hook called with `{ search: string }`
 * @param options.toOptions  - Mapper from raw API data to `ComboboxOption[]`
 * @param options.debounceMs - Debounce delay in ms (default: 300)
 * @returns `{ options, isLoading, onSearchChange }`
 */
export function useAsyncCombobox<TData>({
  useFetch,
  toOptions,
  debounceMs = 300,
}: UseAsyncComboboxOptions<TData>): UseAsyncComboboxResult {
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const onSearchChange = React.useMemo(
    () => debounce((val: string) => setDebouncedSearch(val), debounceMs),
    [debounceMs],
  );

  const { data, isLoading } = useFetch({ search: debouncedSearch });

  const options = React.useMemo(
    () => (data ? toOptions(data) : []),
    // toOptions è escluso intenzionalmente: deve essere stabile (definito fuori
    // dal componente o wrappato con useCallback dal chiamante).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  return { options, isLoading, onSearchChange, debouncedSearch };
}
