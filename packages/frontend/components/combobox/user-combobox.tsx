// components/combobox/user-combobox.tsx
"use client";

import { useUser, useUsers } from "@/hooks/use-user";
import type { ComboboxOption } from "@/types/ui-types";
import type { UserQueryInput } from "@mini-erp/shared";
import {
  AsyncEntityCombobox,
  type EntityComboboxConfig,
  type EntityComboboxProps,
} from "./entity-combobox";

const BASE_PARAMS = {
  page: 1,
  limit: 10,
  sortBy: "username",
  sortOrder: "asc",
  active: true,
} satisfies Partial<UserQueryInput>;

type User = NonNullable<ReturnType<typeof useUsers>["data"]>["data"][number];

const userConfig: EntityComboboxConfig<User> = {
  useList: ({ search }) => {
    const { data, isLoading } = useUsers({ ...BASE_PARAMS, search } satisfies UserQueryInput);
    return { data: data?.data, isLoading };
  },
  // Adjust the accessor to the actual shape returned by `getUserById`
  useSelected: (id) => useUser(id).data?.data,
  toOption: (u): ComboboxOption => ({
    value: u.id,
    label: `${u.details!.firstName} ${u.details!.lastName}`,
    description: u.username,
  }),
  placeholderKey: "userCombobox.placeholder",
  noResultsKey: "userCombobox.noResults",
};

/// Searchable user selector.
export function UserCombobox(props: EntityComboboxProps<User>) {
  return <AsyncEntityCombobox {...userConfig} {...props} />;
}
