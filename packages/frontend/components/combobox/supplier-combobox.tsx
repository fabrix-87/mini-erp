// components/combobox/supplier-combobox.tsx
"use client";

import { useSupplier, useSuppliers } from "@/hooks/use-company";
import type { ComboboxOption } from "@/types/ui-types";
import type { SupplierQueryInput } from "@mini-erp/shared";
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
} satisfies Partial<SupplierQueryInput>;

type Supplier = NonNullable<ReturnType<typeof useSuppliers>["data"]>["data"][number];

const supplierConfig: EntityComboboxConfig<Supplier> = {
  useList: ({ search }) => {
    const { data, isLoading } = useSuppliers({
      ...BASE_PARAMS,
      search,
    } satisfies SupplierQueryInput);
    return { data: data?.data, isLoading };
  },
  useSelected: (id) => useSupplier(id).data?.data,
  toOption: (s): ComboboxOption => ({
    value: s.id,
    label: s.company.companyName,
    description: `[${s.company.code}]`,
  }),
  placeholderKey: "supplierCombobox.placeholder",
  noResultsKey: "supplierCombobox.noResults",
};

/// Searchable supplier selector.
export function SupplierCombobox(props: EntityComboboxProps<Supplier>) {
  return <AsyncEntityCombobox {...supplierConfig} {...props} />;
}
