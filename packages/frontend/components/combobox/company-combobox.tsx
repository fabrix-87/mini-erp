// components/combobox/company-combobox.tsx
"use client";

import { useCompanies } from "@/hooks/use-company";
import type { ComboboxOption } from "@/types/ui-types";
import type { CompanyQueryInput } from "@mini-erp/shared";
import {
  AsyncEntityCombobox,
  type EntityComboboxConfig,
  type EntityComboboxProps,
} from "./entity-combobox";

const BASE_PARAMS = {
  page: 1,
  limit: 10,
  sortOrder: "asc",
  sortBy: "code",
} satisfies Partial<CompanyQueryInput>;

type Company = NonNullable<ReturnType<typeof useCompanies>["data"]>["data"][number];

const companyConfig: EntityComboboxConfig<Company> = {
  useList: ({ search }) => {
    const { data, isLoading } = useCompanies({
      ...BASE_PARAMS,
      search,
    } satisfies CompanyQueryInput);
    return { data: data?.data, isLoading };
  },
  useSelected: (id) =>
    useCompanies(id ? { ...BASE_PARAMS, limit: 1, search: id } : undefined).data?.data?.[0],
  toOption: (c): ComboboxOption => ({
    value: c.id,
    label: c.companyName,
    description: `[${c.code}]`,
  }),
  placeholderKey: "companyCombobox.placeholder",
  noResultsKey: "companyCombobox.noResults",
};

/// Searchable company selector.
export function CompanyCombobox(props: EntityComboboxProps<Company>) {
  return <AsyncEntityCombobox {...companyConfig} {...props} />;
}
