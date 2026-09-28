// components/combobox/customer-combobox.tsx
"use client";

import { useCustomer, useCustomers } from "@/hooks/use-company";
import type { CustomerQueryInput } from "@/types/customer-types";
import type { ComboboxOption } from "@/types/ui-types";
import {
  AsyncEntityCombobox,
  type EntityComboboxConfig,
  type EntityComboboxProps,
} from "./entity-combobox";

const BASE_PARAMS = {
  page: 1,
  limit: 10,
  sortBy: "companyName",
  sortOrder: "asc",
} satisfies CustomerQueryInput;

type Customer = NonNullable<ReturnType<typeof useCustomers>["data"]>["data"][number];

const customerConfig: EntityComboboxConfig<Customer> = {
  useList: ({ search }) => {
    const { data, isLoading } = useCustomers({ ...BASE_PARAMS, search });
    return { data: data?.data, isLoading };
  },
  useSelected: (id) => useCustomer(id).data?.data,
  toOption: (c): ComboboxOption => ({
    value: c.id,
    label: c.company.companyName,
    description: `[${c.company.code}]`,
  }),
  placeholderKey: "customerCombobox.placeholder",
  noResultsKey: "customerCombobox.noResults",
};

/// Searchable customer selector.
export function CustomerCombobox(props: EntityComboboxProps<Customer>) {
  return <AsyncEntityCombobox {...customerConfig} {...props} />;
}
