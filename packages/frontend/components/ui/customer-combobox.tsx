// components/ui/country-combobox.tsx
"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { debounce } from "@/lib/utils";
import { useCustomers } from "@/hooks/use-company";

interface CustomerComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomerCombobox({
  value,
  onValueChange,
  placeholder = "Seleziona cliente...",
  disabled = false,
  className,
}: CustomerComboboxProps) {
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
  const { data: customersData, isLoading } = useCustomers({
    page: 1,
    limit: 10,
    search: debouncedSearch || '',
    sortOrder: 'asc',
    sortBy: 'companyName'
  });

  // Converti i paesi in opzioni per il Combobox
  const options = React.useMemo(() => {
    return (
      customersData?.data?.map((customer) => ({
        value: customer.id,
        label: `${customer.company.companyName}`,
        description: `[${customer.company.code}]`,
      })) || []
    );
  }, [customersData]);

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      onSearchChange={debouncedSetSearch}
      placeholder={placeholder}
      searchPlaceholder="Cerca cliente..."
      emptyText="Nessun clietne trovato"
      disabled={disabled}
      isLoading={isLoading}
      className={className}
    />
  );
}
