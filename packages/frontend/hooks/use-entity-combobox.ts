// hooks/use-entity-combobox.ts
"use client";

import * as React from "react";
import { useAsyncCombobox } from "@/hooks/use-async-combobox";
import type { ComboboxOption } from "@/types/ui-types";

export interface UseEntityComboboxOptions<TItem> {
  /// Currently selected entity ID.
  value?: string;
  /// Domain hook returning the list of items for the given (debounced) search term.
  useList: (params: { search: string }) => {
    data: TItem[] | undefined;
    isLoading: boolean;
  };
  /// Domain hook resolving the selected item by ID, used to restore the label after remounts.
  useSelected: (id: string | undefined) => TItem | undefined;
  /// Pure mapper from an entity to a combobox option. Define it outside the component.
  toOption: (item: TItem) => ComboboxOption;
}

/// Combines async search and selected-option restoration for entity comboboxes.
export function useEntityCombobox<TItem>({
  value,
  useList,
  useSelected,
  toOption,
}: UseEntityComboboxOptions<TItem>) {
  // Async search
  const { options, isLoading, onSearchChange, debouncedSearch, data } = useAsyncCombobox({
    useFetch: useList,
    toOptions: (items: TItem[]) => items.map(toOption),
  });

  // Selected item restoration
  const selectedItem = useSelected(value);

  const mergedOptions = React.useMemo((): ComboboxOption[] => {
    if (!value || debouncedSearch || !selectedItem) return options;
    const selectedOption = toOption(selectedItem);
    if (selectedOption.value !== value) return options;
    if (options.some((o) => o.value === value)) return options;
    return [selectedOption, ...options];
  }, [options, selectedItem, value, debouncedSearch, toOption]);

  // Full entities indexed by option value
  const itemsByValue = React.useMemo(() => {
    const map = new Map<string, TItem>();
    data?.forEach((item) => map.set(toOption(item).value, item));
    if (selectedItem) map.set(toOption(selectedItem).value, selectedItem);
    return map;
  }, [data, selectedItem, toOption]);

  return { options: mergedOptions, isLoading, onSearchChange, itemsByValue };
}
