import { RoleDTO, UserMembershipStatus } from "@mini-erp/shared";

type MembershipWithRoles = {
  roles: Array<{
    role: {
      id: number;
      code: string;
      name: string;
      permissions: Array<{
        permission: { code: string };
      }>;
    };
  }>;
};

/**
 * Returns the current membership for the authenticated user.
 *
 * The default membership is preferred when available; otherwise,
 * the first membership in the list is used as a fallback.
 *
 * @param memberships The list of memberships available to the user.
 * @returns The selected current membership, or null when no memberships exist.
 */
export const pickCurrentMembership = <
  T extends { isDefault: boolean; status: UserMembershipStatus },
>(
  memberships: T[],
): T | null => {
  if (!memberships.length) return null;
  return memberships.find((m) => m.isDefault) || memberships[0] || null;
};

/**
 * Extracts and deduplicates role descriptors from a single membership.
 *
 * The returned roles are scoped to the current tenant membership only.
 *
 * @param membership The membership whose roles should be mapped.
 * @returns A unique list of role DTOs for the provided membership.
 */
export const getRolesFromMembership = (membership: MembershipWithRoles): RoleDTO[] => {
  const rolesMap = new Map<number, RoleDTO>();

  for (const mr of membership.roles) {
    const role = mr.role;

    if (!rolesMap.has(role.id)) {
      rolesMap.set(role.id, {
        id: role.id,
        code: role.code,
        name: role.name,
      });
    }
  }

  return Array.from(rolesMap.values());
};

/**
 * Extracts and deduplicates permission codes from a single membership.
 *
 * Returned permissions are scoped exclusively to the current tenant.
 *
 * @param membership The membership whose permissions should be resolved.
 * @returns A unique list of permission codes for the provided membership.
 */
export const getPermissionsFromMembership = (membership: MembershipWithRoles): string[] => {
  const permissions = new Set<string>();

  for (const mr of membership.roles) {
    for (const rp of mr.role.permissions) {
      permissions.add(rp.permission.code);
    }
  }

  return Array.from(permissions);
};
