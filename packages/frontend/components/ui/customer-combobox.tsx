// packages/frontend/components/ui/customer-combobox.tsx
"use client";

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
import { useMemo } from "react";
import { useTranslations } from "next-intl";

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
  disabled?: boolean;
  className?: string;
}

/**
 * Async combobox for customer selection with debounced search.
 */
export function CustomerCombobox({
  value,
  onValueChange,
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

  const t = useTranslations("ui");

  const { data: selectedData } = useCustomers(
    value && !debouncedSearch ? { ...BASE_PARAMS, limit: 1, search: value } : undefined,
  );

  const mergedOptions = useMemo((): ComboboxOption[] => {
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
      items={mergedOptions}
      itemToStringValue={(mergedOption: ComboboxOption) => mergedOption.label}
      value={mergedOptions.find((item) => item.value === value) || null}
      onValueChange={(newValue) => {
        onValueChange?.(newValue?.value || "");
      }}
      filter={null}
    >
      <ComboboxInput
        placeholder={t("customerCombobox.placeholder")}
        className={className}
        showClear
        disabled={disabled}
        onInput={(e) => {
          const searchString = e.currentTarget.value;
          const selectedOption = mergedOptions.find((item) => item.value === value) || null;

          // Se la stringa digitata/impostata corrisponde al label già selezionato, non cercare
          if (selectedOption && searchString === selectedOption.label) {
            return;
          }

          onSearchChange(searchString);
        }}
      />
      <ComboboxContent>
        <ComboboxEmpty>{isLoading ? t("loading") : t("customerCombobox.noResults")}</ComboboxEmpty>
        <ComboboxList>
          {(opt) => (
            <ComboboxItem key={opt.value} value={opt}>
              <span>{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
