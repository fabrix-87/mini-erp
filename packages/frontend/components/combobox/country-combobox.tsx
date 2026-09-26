// packages/frontend/components/ui/country-combobox.tsx
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
import { useCountries } from "@/hooks/use-country";
import { useAsyncCombobox } from "@/hooks/use-async-combobox";
import type { CountryQueryInput } from "@/types/country";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

function toCountryOptions(
  data: Awaited<ReturnType<typeof useCountries>>["data"],
): ComboboxOption[] {
  return (
    data?.data?.map((country) => ({
      value: country.code,
      label: `${country.name} (${country.code})`,
      description: country.isEu ? "Unione Europea" : undefined,
    })) ?? []
  );
}

interface CountryComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isEU?: boolean;
}

/**
 * Async combobox for country selection with debounced search.
 */
export function CountryCombobox({
  value,
  onValueChange,
  placeholder = "Seleziona paese...",
  disabled = false,
  className,
  isEU,
}: CountryComboboxProps) {
  const BASE_PARAMS = {
      page: 1,
      limit: 10,
      isEU,
    } satisfies Partial<CountryQueryInput>;

  const { options, isLoading, onSearchChange, debouncedSearch } = useAsyncCombobox({
    useFetch: ({ search }: { search: string }) =>
      useCountries({
        ...BASE_PARAMS,
        search
      } satisfies CountryQueryInput),
    toOptions: toCountryOptions,
  });

  const t = useTranslations("ui");
  
    const { data: selectedData } = useCountries(
      value && !debouncedSearch ? { ...BASE_PARAMS, limit: 1, search: value } : undefined,
    );
  
    const mergedOptions = useMemo((): ComboboxOption[] => {
      if (!value || debouncedSearch) return options;
      const selected = selectedData?.data?.[0];
      if (!selected || options.some((o) => o.value === selected.code)) return options;
      return [
        {
          value: selected.code,
          label: selected.name
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
