// components/ui/lead-combobox.tsx
"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useAsyncCombobox } from "@/hooks/use-async-combobox";
import { useMemo } from "react";
import { useLeads } from "@/hooks/use-lead";
import { LeadQueryInput } from "@mini-erp/shared";
import { ComboboxOption } from "@/types/ui-types";
import { useTranslations } from "next-intl";

interface LeadComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Stabile fuori dal componente — nessuna istanza spuria per ogni render.
function toLeadOptions(data: Awaited<ReturnType<typeof useLeads>>["data"]): ComboboxOption[] {
  return (
    data?.data?.map((c) => ({
      value: c.id,
      label: c.companyName,
      description: `[${c.code}] ${c.description ? `- ${c.description}` : ""}`,
    })) ?? []
  );
}

/**
 * Async combobox for lead selection with debounced search.
 * On mount with an existing `value`, performs a secondary query to restore
 * the selected label after tab switches or remounts.
 *
 * @param value         - Currently selected lead ID
 * @param onValueChange - Callback fired with the new lead ID on selection
 * @param placeholder   - Trigger button label when no value is selected
 * @param disabled      - Disables the combobox
 * @param className     - Additional CSS classes on the trigger button
 */
export function LeadCombobox({
  value,
  onValueChange,
  disabled = false,
  className,
}: LeadComboboxProps) {
  const BASE_PARAMS = {
    page: 1,
    limit: 10,
    sortBy: "companyName",
    sortOrder: "asc",
  } satisfies Partial<LeadQueryInput>;

  const { options, isLoading, onSearchChange, debouncedSearch } = useAsyncCombobox({
    useFetch: ({ search }: { search: string }) =>
      useLeads({ ...BASE_PARAMS, search } satisfies LeadQueryInput),
    toOptions: toLeadOptions,
  });

  const t = useTranslations('ui')

  // Query per ID — ripristina il label dopo remount (cambio tab)
  const { data: selectedData } = useLeads(
    value && !debouncedSearch ? { ...BASE_PARAMS, limit: 1, search: value } : BASE_PARAMS,
  );

  const mergedOptions = useMemo((): ComboboxOption[] => {
    if (!value || debouncedSearch) return options;
    const selected = selectedData?.data?.[0];
    if (!selected || options.some((o) => o.value === selected.id)) return options;
    return [
      {
        value: selected.id,
        label: selected.companyName,
        description: `[${selected.code}] ${selected.description ? `- ${selected.description}` : ""}`,
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
        placeholder={t('leadCombobox.placeholder')}
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
        <ComboboxEmpty>{isLoading ? t('loading') : t('leadCombobox.noResults')}</ComboboxEmpty>
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
