// packages/frontend/components/ui/company-combobox.tsx
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
import { useCompanies } from "@/hooks/use-company";
import { useAsyncCombobox } from "@/hooks/use-async-combobox";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { CompanyQueryInput } from "@mini-erp/shared";

function toCompanyOptions(
  data: Awaited<ReturnType<typeof useCompanies>>["data"],
): ComboboxOption[] {
  return (
    data?.data?.map((c) => ({
      value: c.id,
      label: c.companyName,
      description: `[${c.code}]`,
    })) ?? []
  );
}

interface CompanyComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Async combobox for company selection with debounced search.
 */
export function CompanyCombobox({
  value,
  onValueChange,
  disabled = false,
  className,
}: CompanyComboboxProps) {
  const BASE_PARAMS = {
    page: 1,
    limit: 10,
    sortOrder: "asc",
    sortBy: "code",
  } satisfies Partial<CompanyQueryInput>;

  const { options, isLoading, onSearchChange, debouncedSearch } = useAsyncCombobox({
    useFetch: ({ search }: { search: string }) =>
      useCompanies({ ...BASE_PARAMS, search } satisfies CompanyQueryInput),
    toOptions: toCompanyOptions,
  });

  const t = useTranslations("ui");

  const { data: selectedData } = useCompanies(
    value && !debouncedSearch ? { ...BASE_PARAMS, limit: 1, search: value } : undefined,
  );

  const mergedOptions = useMemo((): ComboboxOption[] => {
    if (!value || debouncedSearch) return options;
    const selected = selectedData?.data?.[0];
    if (!selected || options.some((o) => o.value === selected.id)) return options;
    return [
      {
        value: selected.id,
        label: selected.companyName,
        description: `[${selected.code}]`,
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
        placeholder={t("companyCombobox.placeholder")}
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
        <ComboboxEmpty>{isLoading ? t("loading") : t("companyCombobox.noResults")}</ComboboxEmpty>
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
