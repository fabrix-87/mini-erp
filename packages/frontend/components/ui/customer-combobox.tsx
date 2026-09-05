// components/ui/customer-combobox.tsx
"use client";

import * as React from "react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useCustomers } from "@/hooks/use-company";
import { useAsyncCombobox } from "@/hooks/use-async-combobox";
import type { CustomerQueryInput } from "@/types/customer-types";

interface CustomerComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Stabile fuori dal componente — nessuna istanza spuria per ogni render.
function toCustomerOptions(
  data: Awaited<ReturnType<typeof useCustomers>>["data"],
): ComboboxOption[] {
  return (
    data?.data?.map((c) => ({
      value: c.id,
      label: c.company.companyName,
      description: `[${c.company.code}]`,
    })) ?? []
  );
}

/**
 * Async combobox for customer selection with debounced search.
 * On mount with an existing `value`, performs a secondary query to restore
 * the selected label after tab switches or remounts.
 *
 * @param value         - Currently selected customer ID
 * @param onValueChange - Callback fired with the new customer ID on selection
 * @param placeholder   - Trigger button label when no value is selected
 * @param disabled      - Disables the combobox
 * @param className     - Additional CSS classes on the trigger button
 */
export function CustomerCombobox({
  value,
  onValueChange,
  placeholder = "Seleziona cliente...",
  disabled = false,
  className,
}: CustomerComboboxProps) {
  const BASE_PARAMS = {
    page: 1,
    limit: 10,
    sortBy: "companyName",
    sortOrder: "asc",
  } satisfies Partial<CustomerQueryInput>;

  const { options, isLoading, onSearchChange, debouncedSearch } = useAsyncCombobox({
    useFetch: ({ search }: { search: string }) =>
      useCustomers({ ...BASE_PARAMS, search } satisfies CustomerQueryInput),
    toOptions: toCustomerOptions,
  });

  // Query per ID — ripristina il label dopo remount (cambio tab)
  const { data: selectedData } = useCustomers(
    value && !debouncedSearch ? { ...BASE_PARAMS, limit: 1, search: value } : undefined,
  );

  const mergedOptions = React.useMemo((): ComboboxOption[] => {
    if (!value || debouncedSearch) return options;
    const selected = selectedData?.data?.[0];
    if (!selected || options.some((o) => o.value === selected.id)) return options;
    return [
      {
        value: selected.id,
        label: selected.company.companyName,
        description: `[${selected.company.code}]`,
      },
      ...options,
    ];
  }, [options, selectedData, value, debouncedSearch]);

  return (
    <Combobox
      options={mergedOptions}
      value={value}
      onValueChange={onValueChange}
      onSearchChange={onSearchChange}
      placeholder={placeholder}
      searchPlaceholder="Cerca cliente..."
      emptyText="Nessun cliente trovato"
      disabled={disabled}
      isLoading={isLoading}
      className={className}
    />
  );
}
