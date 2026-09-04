// components/ui/user-combobox.tsx
"use client";

import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { debounce } from "@/lib/utils";
import { useUsers } from "@/hooks/use-user";

interface UserComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function UserCombobox({
  value,
  onValueChange,
  placeholder = "Seleziona paese...",
  disabled = false,
  className,
}: UserComboboxProps) {
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
  const { data: usersData, isLoading } = useUsers({
    page: 1,
    limit: 10,
    search: debouncedSearch ?? "",
    sortBy: "username",
    sortOrder: "asc",
    active: true,
  });

  // Query per ID — serve a ripristinare il label dopo remount (cambio tab)
  const { data: selectedData } = useUsers(
    value && !debouncedSearch
      ? { page: 1, limit: 1, search: value, sortOrder: "asc", sortBy: "username", active: true }
      : { page: 1, limit: 1, sortOrder: "asc", sortBy: "username" }, // skip se non c'è value o se l'utente sta cercando
  );

  // Converti i paesi in opzioni per il Combobox
  const options = React.useMemo(() => {
    const base = usersData?.data ?? [];
    // Se stiamo visualizzando un valore senza ricerca attiva,
    // assicuriamoci che l'opzione selezionata sia sempre presente
    if (value && !debouncedSearch && selectedData?.data?.[0]) {
      const selected = selectedData.data[0];
      const alreadyInList = base.some((c) => c.id === selected.id);
      if (!alreadyInList) {
        return [
          {
            value: selected.id,
            label: `${selected.details.firstName} ${selected.details.lastName}`,
            description: `${selected.username}`,
          },
          ...base.map((c) => ({
            value: c.id,
            label: `${c.details.firstName} ${c.details.lastName}`,
            description: `${c.username}`,
          })),
        ];
      }
    }
    return base.map((c) => ({
      value: c.id,
      label: `${c.details.firstName} ${c.details.lastName}`,
      description: `${c.username}`,
    }));
  }, [usersData, selectedData, value, debouncedSearch]);

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      onSearchChange={debouncedSetSearch}
      placeholder={placeholder}
      searchPlaceholder="Cerca utente..."
      emptyText="Nessun utente trovato"
      disabled={disabled}
      isLoading={isLoading}
      className={className}
    />
  );
}
