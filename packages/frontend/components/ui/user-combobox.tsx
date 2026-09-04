// components/ui/country-combobox.tsx
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
  const { data: usersData, isLoading } = useUsers({
    page: 1,
    limit: 10,
    search: debouncedSearch ?? "",
    sortBy: 'username',
    sortOrder: 'asc',
    active: true,
  });

  // Converti i paesi in opzioni per il Combobox
  const options = React.useMemo(() => {
    return (
      usersData?.data?.map((user) => ({
        value: user.id,
        label: `${user.details.firstName} ${user.details.lastName}`,
        description: `${user.username}`
      })) || []
    );
  }, [usersData]);

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
