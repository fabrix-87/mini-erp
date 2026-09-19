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
      value={value}
      onValueChange={(newValue) => {
        if (newValue !== null) {
          onValueChange?.(newValue);
        }
      }}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        className={className}
        onChange={(e) => onSearchChange(e.target.value)}
        showTrigger
        showClear={!!value}
      />

      <ComboboxContent>
        <ComboboxList>
          {options.map((opt) => (
            <ComboboxItem key={opt.value} value={opt.value}>
              <span>{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>

        {!isLoading && options.length === 0 && <ComboboxEmpty />}
      </ComboboxContent>
    </Combobox>
  );
}
