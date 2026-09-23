// components/ui/user-combobox.tsx
"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useUsers } from "@/hooks/use-user";
import { useAsyncCombobox } from "@/hooks/use-async-combobox";
import type { UserQueryInput } from "@mini-erp/shared";
import { ComboboxOption } from "@/types/ui-types";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface UserComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Stabile fuori dal componente — nessuna istanza spuria per ogni render.
function toUserOptions(data: Awaited<ReturnType<typeof useUsers>>["data"]): ComboboxOption[] {
  return (
    data?.data?.map((u) => ({
      value: u.id,
      label: `${u.details.firstName} ${u.details.lastName}`,
      description: u.username,
    })) ?? []
  );
}

/**
 * Async combobox for user selection with debounced search.
 * On mount with an existing `value`, performs a secondary query to restore
 * the selected label after tab switches or remounts.
 *
 * @param value         - Currently selected user ID
 * @param onValueChange - Callback fired with the new user ID on selection
 * @param placeholder   - Trigger button label when no value is selected
 * @param disabled      - Disables the combobox
 * @param className     - Additional CSS classes on the trigger button
 */
export function UserCombobox({
  value,
  onValueChange,
  disabled = false,
  className,
}: UserComboboxProps) {
  const BASE_PARAMS = {
    page: 1,
    limit: 10,
    sortBy: "username",
    sortOrder: "asc",
    active: true,
  } satisfies Partial<UserQueryInput>;

  const t = useTranslations("ui");
  const { options, isLoading, onSearchChange, debouncedSearch } = useAsyncCombobox({
    useFetch: ({ search }: { search: string }) =>
      useUsers({ ...BASE_PARAMS, search } satisfies UserQueryInput),
    toOptions: toUserOptions,
  });

  // Query per ID — ripristina il label dopo remount (cambio tab)
  const { data: selectedData } = useUsers(
    value && !debouncedSearch ? { ...BASE_PARAMS, limit: 1, search: value } : { ...BASE_PARAMS },
  );

  const mergedOptions = useMemo((): ComboboxOption[] => {
    if (!value || debouncedSearch) return options;
    const selected = selectedData?.data?.[0];
    if (!selected || options.some((o) => o.value === selected.id)) return options;
    return [
      {
        value: selected.id,
        label: `${selected.details.firstName} ${selected.details.lastName}`,
        description: selected.username,
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
        console.log(newValue)
        onValueChange(newValue?.value || "");
      }}
      filter={null}
    >
      <ComboboxInput
        placeholder={t("userCombobox.placeholder")}
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
        <ComboboxEmpty>{isLoading ? t("loading") : t("userCombobox.noResults")}</ComboboxEmpty>
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
