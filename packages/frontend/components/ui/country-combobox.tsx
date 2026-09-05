// components/ui/country-combobox.tsx
"use client";

import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useCountries } from "@/hooks/use-country";
import { useAsyncCombobox } from "@/hooks/use-async-combobox";
import type { CountryQueryInput } from "@/types/country";

interface CountryComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isEU?: boolean;
}

// Stabile fuori dal componente: non viene ricreata a ogni render.
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

/**
 * Async combobox for country selection with debounced search.
 * Delegates debounce and option derivation to `useAsyncCombobox`.
 *
 * @param value          - Currently selected country code
 * @param onValueChange  - Callback fired with the new country code on selection
 * @param placeholder    - Trigger button label when no value is selected
 * @param disabled       - Disables the combobox
 * @param className      - Additional CSS classes on the trigger button
 * @param isEU           - When true, filters to EU countries only
 */
export function CountryCombobox({
  value,
  onValueChange,
  placeholder = "Seleziona paese...",
  disabled = false,
  className,
  isEU,
}: CountryComboboxProps) {
  const { options, isLoading, onSearchChange } = useAsyncCombobox({
    useFetch: ({ search }: { search: string }) =>
      useCountries({
        page: 1,
        limit: 10,
        search: search || "Italia",
        isEU,
      } satisfies CountryQueryInput),
    toOptions: toCountryOptions,
  });

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      onSearchChange={onSearchChange}
      placeholder={placeholder}
      searchPlaceholder="Cerca paese..."
      emptyText="Nessun paese trovato"
      disabled={disabled}
      isLoading={isLoading}
      className={className}
    />
  );
}
