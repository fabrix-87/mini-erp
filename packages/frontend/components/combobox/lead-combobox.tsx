// packages/frontend/components/combobox/lead-combobox.tsx
"use client";

import { useLead, useLeads } from "@/hooks/use-lead";
import type { ComboboxOption } from "@/types/ui-types";
import type { LeadQueryInput } from "@mini-erp/shared";
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
} satisfies Partial<LeadQueryInput>;

/// Lead item as returned by the paginated leads endpoint.
export type Lead = NonNullable<ReturnType<typeof useLeads>["data"]>["data"][number];

/// Maps a lead to a combobox option. Defined at module level to keep it referentially stable.
function toLeadOption(lead: Lead): ComboboxOption {
  return {
    value: lead.id,
    label: lead.companyName,
    description: `[${lead.code}]${lead.description ? ` - ${lead.description}` : ""}`,
  };
}

const leadConfig: EntityComboboxConfig<Lead> = {
  useList: ({ search }) => {
    const { data, isLoading } = useLeads({ ...BASE_PARAMS, search } satisfies LeadQueryInput);
    return { data: data?.data, isLoading };
  },
  // Resolves the selected lead by ID to restore the label after remounts
  useSelected: (id) => useLead(id).data?.data,
  toOption: toLeadOption,
  placeholderKey: "leadCombobox.placeholder",
  noResultsKey: "leadCombobox.noResults",
};

/// Searchable lead selector.
export function LeadCombobox(props: EntityComboboxProps<Lead>) {
  return <AsyncEntityCombobox {...leadConfig} {...props} />;
}
