// components/ui/customer-combobox.tsx
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

/**
 * Async combobox for customer selection.
 * Fetches by search term; on mount with an existing value,
 * fetches by ID to restore the selected label after tab switches.
 */
export function CustomerCombobox({
  value,
  onValueChange,
  placeholder = "Seleziona cliente...",
  disabled = false,
  className,
}: CustomerComboboxProps) {
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Debounce della ricerca
  const debouncedSetSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 300),
    [],
  );

  // Query con parametro search
  const { data: customersData, isLoading } = useCustomers({
    page: 1,
    limit: 10,
    search: debouncedSearch || "",
    sortOrder: "asc",
    sortBy: "companyName",
  });

  // Query per ID — serve a ripristinare il label dopo remount (cambio tab)
  const { data: selectedData } = useCustomers(
    value && !debouncedSearch
      ? { page: 1, limit: 1, search: value, sortOrder: "asc", sortBy: "companyName" }
      : undefined, // skip se non c'è value o se l'utente sta cercando
  );

  const options = React.useMemo(() => {
    const base = customersData?.data ?? [];
    // Se stiamo visualizzando un valore senza ricerca attiva,
    // assicuriamoci che l'opzione selezionata sia sempre presente
    if (value && !debouncedSearch && selectedData?.data?.[0]) {
      const selected = selectedData.data[0];
      const alreadyInList = base.some((c) => c.id === selected.id);
      if (!alreadyInList) {
        return [
          {
            value: selected.id,
            label: selected.company.companyName,
            description: `[${selected.company.code}]`,
          },
          ...base.map((c) => ({
            value: c.id,
            label: c.company.companyName,
            description: `[${c.company.code}]`,
          })),
        ];
      }
    }
    return base.map((c) => ({
      value: c.id,
      label: c.company.companyName,
      description: `[${c.company.code}]`,
    }));
  }, [customersData, selectedData, value, debouncedSearch]);

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
