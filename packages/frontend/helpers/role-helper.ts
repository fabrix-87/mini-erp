import { RoleQueryInput } from "@mini-erp/shared";

// ============================================================================
// QUERY BUILDER
// ============================================================================

type QueryValue = string | number | boolean | null | undefined | Array<string | number | boolean>;

export const buildQueryString = <T extends Record<string, QueryValue>>(params: T): string => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((v) => v != null && query.append(key, String(v)));
    } else {
      query.append(key, String(value));
    }
  });

  return query.toString();
};
