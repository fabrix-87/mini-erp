// components/combobox/country-combobox.tsx
"use client";

import { useCountries } from "@/hooks/use-country";
import type { CountryQueryInput } from "@/types/country";
import type { ComboboxOption } from "@/types/ui-types";
import {
  AsyncEntityCombobox,
  type EntityComboboxConfig,
  type EntityComboboxProps,
} from "./entity-combobox";

type Country = NonNullable<ReturnType<typeof useCountries>["data"]>["data"][number];

const toCountryOption = (c: Country): ComboboxOption => ({
  value: c.code,
  label: `${c.name} (${c.code})`,
  description: c.isEu ? "Unione Europea" : undefined,
});

/// Searchable country selector.
export function CountryCombobox({ isEU, ...props }: EntityComboboxProps<Country> & { isEU?: boolean }) {
  const base = { page: 1, limit: 10, isEU } satisfies Partial<CountryQueryInput>;

  const config: EntityComboboxConfig<Country> = {
    useList: ({ search }) => {
      const { data, isLoading } = useCountries({ ...base, search } satisfies CountryQueryInput);
      return { data: data?.data, isLoading };
    },
    useSelected: (code) =>
      useCountries(code ? { ...base, limit: 1, search: code } : undefined).data?.data?.[0],
    toOption: toCountryOption,
    placeholderKey: "countryCombobox.placeholder",
    noResultsKey: "countryCombobox.noResults",
  };

  return <AsyncEntityCombobox {...config} {...props} />;
}
