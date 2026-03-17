import {
  ApiResponse,
  AssignPermissionsInput,
  CreatePermissionInput,
  CreateRoleInput,
  Permission,
  PermissionQueryInput,
  PaginationInfo,
  Role,
  RoleQueryInput,
  RoleSortField,
  SortOrder,
  UpdatePermissionInput,
  UpdateRoleInput,
} from "@mini-erp/shared";

export type RoleFilters = Omit<RoleQueryInput, "page" | "limit">;
export type PermissionFilters = Omit<PermissionQueryInput, "page" | "limit">;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface RoleListApiResponse extends ApiResponse<Role[]> {}
export interface RoleSingleApiResponse extends ApiResponse<Role> {}
export interface RoleDeleteApiResponse extends ApiResponse<null> {}
export interface AssignRemovePermissionsResponse extends ApiResponse<{ permissionIds: number[] }> {}

export interface PermissionListApiResponse extends ApiResponse<Permission[]> {}
export interface PermissionSingleApiResponse extends ApiResponse<Permission> {}
export interface PermissionDeleteApiResponse extends ApiResponse<null> {}

export interface RolePermissionsApiResponse extends ApiResponse<{
  role: Pick<Role, "id" | "code" | "name">;
  permissions: Permission[];
}> {}

export const defaultParams: RoleQueryInput = {
  sortBy: "code",
  sortOrder: "asc",
  page: 1,
  limit: 20,
};

export const defaultPermissionParams: PermissionQueryInput = {
  sortBy: "resource",
  sortOrder: "asc",
};

// ============================================================================
// QUERY KEYS
// ============================================================================

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (params: RoleQueryInput) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
  permissions: (id: number) => [...roleKeys.detail(id), "permissions"] as const,
  byPermission: (permissionId: number) => [...roleKeys.all, "permission", permissionId] as const,
};

export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: (params?: PermissionQueryInput) => [...permissionKeys.lists(), params] as const,
  details: () => [...permissionKeys.all, "detail"] as const,
  detail: (id: number) => [...permissionKeys.details(), id] as const,
};

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

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

export interface UseRoleReturn {
  role: Role | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseRoleMutationsReturn {
  createRole: (data: CreateRoleInput) => Promise<Role>;
  updateRole: (id: number, data: UpdateRoleInput) => Promise<Role>;
  deleteRole: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface UsePermissionsReturn {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UsePermissionMutationsReturn {
  createPermission: (data: CreatePermissionInput) => Promise<Permission>;
  updatePermission: (id: number, data: UpdatePermissionInput) => Promise<Permission>;
  deletePermission: (id: number) => Promise<void>;
  assignPermissionsToRole: (roleId: number, data: AssignPermissionsInput) => Promise<Role>;
  removePermissionsFromRole: (roleId: number, data: AssignPermissionsInput) => Promise<Role>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isAssigning: boolean;
  isRemoving: boolean;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface RoleFormProps {
  mode: "create" | "edit";
  roleId?: number;
}

export interface PermissionDialogState {
  open: boolean;
  mode: "create" | "edit";
  permission: Permission | null;
}

export interface RoleFormValues {
  name: string;
  code: string;
  description: string;
  isDefault: boolean;
}

export interface RoleDetailProps {
  roleId: number;
}
