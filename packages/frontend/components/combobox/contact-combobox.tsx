// packages/frontend/components/combobox/contact-combobox.tsx
"use client";

import { useContact, useContacts } from "@/hooks/use-contact";
import type { ComboboxOption } from "@/types/ui-types";
import type { ContactQueryInput } from "@mini-erp/shared";
import {
  AsyncEntityCombobox,
  type EntityComboboxConfig,
  type EntityComboboxProps,
} from "./entity-combobox";

const BASE_PARAMS = {
  page: 1,
  limit: 10,
  sortBy: "firstName",
  sortOrder: "asc",
} satisfies Partial<ContactQueryInput>;

/// Contact item as returned by the paginated contacts endpoint.
export type Contact = NonNullable<ReturnType<typeof useContacts>["data"]>["data"][number];

/// Maps a contact to a combobox option. Defined at module level to keep it referentially stable.
function toContactOption(contact: Contact): ComboboxOption {
  return {
    value: contact.id,
    label: `${contact.firstName} ${contact.lastName}`,
    description: `[${contact.email}]`,
  };
}

/// Optional filters that restrict the searchable contacts.
interface ContactComboboxFilters {
  /// Only contacts belonging to this company.
  companyId?: string;
  /// Only contacts belonging to this customer.
  customerId?: string;
}

/// Searchable contact selector, optionally scoped to a company or a customer.
export function ContactCombobox({
  companyId,
  customerId,
  ...props
}: EntityComboboxProps<Contact> & ContactComboboxFilters) {
  // Only defined filters are sent to the API
  const filters = {
    ...(companyId && { companyId }),
    ...(customerId && { customerId }),
  };

  const config: EntityComboboxConfig<Contact> = {
    useList: ({ search }) => {
      const { data, isLoading } = useContacts({
        ...BASE_PARAMS,
        ...filters,
        search,
      } satisfies ContactQueryInput);
      return { data: data?.data, isLoading };
    },
    // `useContact` already unwraps the response
    useSelected: (id) => useContact(id ?? "").contact ?? undefined,
    toOption: toContactOption,
    placeholderKey: "contactCombobox.placeholder",
    noResultsKey: "contactCombobox.noResults",
  };

  return <AsyncEntityCombobox {...config} {...props} />;
}
