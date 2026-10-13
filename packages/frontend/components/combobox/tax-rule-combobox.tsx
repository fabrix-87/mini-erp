// packages/frontend/components/combobox/tax-rule-combobox.tsx
"use client";

import type { ComboboxOption } from "@/types/ui-types";
import { TaxRule, TaxRuleQueryInput } from "@mini-erp/shared";

import {
  AsyncEntityCombobox,
  type EntityComboboxConfig,
  type EntityComboboxProps,
} from "./entity-combobox";
import { useTaxRule, useTaxRules } from "@/hooks/use-tax-rule";

const BASE_PARAMS = {
  page: 1,
  limit: 10,
  sortBy: "displayOrder",
  sortOrder: "asc",
} satisfies TaxRuleQueryInput;

/// Contact item as returned by the paginated contacts endpoint.
//export type Contact = NonNullable<ReturnType<typeof useTaxRules>["data"]>["data"][number];

/// Maps a contact to a combobox option. Defined at module level to keep it referentially stable.
function toRuleOption(rule: TaxRule): ComboboxOption {
  return {
    value: rule.id?.toString(),
    label: `[${rule.code}] ${rule.name}`,
    description: rule.description ?? undefined,
  };
}

/// Searchable TaxRule selector
export function TaxRuleCombobox({ ...props }: EntityComboboxProps<TaxRule>) {
  const config: EntityComboboxConfig<TaxRule> = {
    useList: ({ search }) => {
      const { data, isLoading } = useTaxRules({
        ...BASE_PARAMS,
        search,
      } satisfies TaxRuleQueryInput);
      return { data: data?.data, isLoading };
    },
    // `useTaxRule` already unwraps the response
    useSelected: (id) => {
      return id ? (useTaxRule(Number(id)).taxRule ?? undefined) : undefined;
    },
    toOption: toRuleOption,
    placeholderKey: "taxRuleCombobox.placeholder",
    noResultsKey: "taxRuleCombobox.noResults",
  };

  return <AsyncEntityCombobox {...config} {...props} />;
}
