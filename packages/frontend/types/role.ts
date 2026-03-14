import {
  ApiResponse,
  CreateRoleInput,
  PaginationInfo,
  Role,
  RoleQueryInput,
  RoleSortField,
  SortOrder,
  UpdateRoleInput,
} from "@mini-erp/shared";

export type RoleFilters = Omit<RoleQueryInput, "page" | "limit">;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface RoleListApiResponse extends ApiResponse<Role[]> {}

export interface RoleSingleApiResponse extends ApiResponse<Role> {}

export interface RoleDeleteApiResponse extends ApiResponse<null> {}

export const defaultParams: RoleQueryInput = {
  sortBy: "code",
  sortOrder: "asc",
  page: 1,
  limit: 20,
};

// ============================================================================
// HOOKS TYPES
// ============================================================================

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (params: RoleQueryInput) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
  byPermission: (permissionId: number) => [...roleKeys.all, "permission", permissionId] as const,
};

/**
 * Return type UseRoles hook
 */
export interface UseRolesReturn {
  roles: Role[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  filters: RoleFilters;
  refetch: () => Promise<void>;
  sort: {
    field: RoleSortField;
    order: SortOrder;
  };
}

/**
 * Return type UseRole hook
 */
export interface UseRoleReturn {
  role: Role | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Return type useRoleMutations hook
 */
export interface UseRoleMutationsReturn {
  createRole: (data: CreateRoleInput) => Promise<Role>;
  updateRole: (id: number, data: UpdateRoleInput) => Promise<Role>;
  deleteRole: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}