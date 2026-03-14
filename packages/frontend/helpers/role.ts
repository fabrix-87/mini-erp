import { RoleQueryInput } from "@mini-erp/shared";

// ============================================================================
// QUERY BUILDER
// ============================================================================

export const buildQueryString = (params: RoleQueryInput): string => {
  const query = new URLSearchParams();

  if (params.search) query.append('search', params.search);
  if (params.isDefault) query.append('isDefault', params.isDefault.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  return query.toString();
};