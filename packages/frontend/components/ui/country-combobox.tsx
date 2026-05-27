// components/ui/country-combobox.tsx
"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { useCountries } from "@/hooks/use-country";
import { debounce } from "@/lib/utils";

interface CountryComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isEU?: boolean;
}

export function CountryCombobox({
  value,
  onValueChange,
  placeholder = "Seleziona paese...",
  disabled = false,
  className,
  isEU,
}: CountryComboboxProps) {
  const [debouncedSearch, setDebouncedSearch] = React.useState(value ?? "");

  // Debounce della ricerca
  const debouncedSetSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 300),
    []
  );

  // Query con parametro search
  const { data: countriesData, isLoading } = useCountries({
    page: 1,
    limit: 10,
    search: debouncedSearch || 'Italia',
    isEU,
  });

  // Converti i paesi in opzioni per il Combobox
  const options = React.useMemo(() => {
    return (
      countriesData?.data?.map((country) => ({
        value: country.code,
        label: `${country.name} (${country.code})`,
        description: country.isEu ? "Unione Europea" : undefined,
      })) || []
    );
  }, [countriesData]);

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      onSearchChange={debouncedSetSearch}
      placeholder={placeholder}
      searchPlaceholder="Cerca paese..."
      emptyText="Nessun paese trovato"
      disabled={disabled}
      isLoading={isLoading}
      className={className}
    />
  );
}
