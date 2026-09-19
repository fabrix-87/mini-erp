// packages/frontend/components/ui/customer-combobox.tsx
"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import type { ComboboxOption } from "@/types/ui-types";
import { useCustomers } from "@/hooks/use-company";
import { useAsyncCombobox } from "@/hooks/use-async-combobox";
import type { CustomerQueryInput } from "@/types/customer-types";

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

interface CustomerComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Async combobox for customer selection with debounced search.
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
      value={value ?? null}
      onValueChange={(newValue) => {
        if (newValue !== null) {
          onValueChange?.(newValue);
        }
      }}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        className={className}
        onChange={(e) => onSearchChange(e.target.value)}
        showTrigger
        showClear={!!value}
      />

      <ComboboxContent>
        <ComboboxList>
          {mergedOptions.map((opt) => (
            <ComboboxItem key={opt.value} value={opt.value}>
              <span>{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>

        {!isLoading && mergedOptions.length === 0 && <ComboboxEmpty />}
      </ComboboxContent>
    </Combobox>
  );
}
