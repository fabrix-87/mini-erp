// packages/backend/controllers/user-membership-roles-controller.ts

import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";
import { sendSuccess } from "@/utils/response-utils";
import {
  AssignRolesToUserInput,
  RemoveRolesFromUserInput,
  MembershipUserIdParam,
} from "@mini-erp/shared/types";
import { prisma } from "@/config/prisma-config";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Resolves the UserTenantMembership for a user within the current tenant,
 * including the currently assigned roles.
 * Throws NotFoundError if the membership does not exist.
 */
async function resolveMembership(userId: string, tenantId: string) {
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
    include: {
      roles: {
        select: {
          roleId: true,
          role: {
            select: { id: true, code: true, name: true, description: true },
          },
        },
      },
    },
  });

  if (!membership) {
    throw new NotFoundError("Membership non trovata per l'utente nel tenant corrente");
  }

  return membership;
}

// ============================================================================
// READ
// ============================================================================

/**
 * Returns all roles assigned to a user within the current tenant membership.
 *
 * @route GET /api/memberships/:userId/roles
 */
export const getMembershipRoles = async (c: Context<AppBindings>) => {
  const { userId } = getValidatedParams<MembershipUserIdParam>(c);
  const tenantId = c.get("currentTenantId")!;

  const membership = await resolveMembership(userId, tenantId);
  const roles = membership.roles.map((r) => r.role);

  return sendSuccess(c, { userId, membershipId: membership.id, roles }, { results: roles.length });
};

/**
 * Returns all effective permissions of a user in the current tenant,
 * aggregated across all assigned roles (deduped by permission ID).
 *
 * @route GET /api/memberships/:userId/permissions
 */
export const getMembershipPermissions = async (c: Context<AppBindings>) => {
  const { userId } = getValidatedParams<MembershipUserIdParam>(c);
  const tenantId = c.get("currentTenantId")!;

  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: {
                    select: {
                      id: true,
                      code: true,
                      resource: true,
                      action: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!membership) {
    throw new NotFoundError("Membership non trovata per l'utente nel tenant corrente");
  }

  // Deduplica per permission.id
  const permissionsMap = new Map<
    number,
    (typeof membership.roles)[0]["role"]["permissions"][0]["permission"]
  >();
  for (const { role } of membership.roles) {
    for (const { permission } of role.permissions) {
      permissionsMap.set(permission.id, permission);
    }
  }

  const permissions = Array.from(permissionsMap.values());

  return sendSuccess(
    c,
    { userId, membershipId: membership.id, permissions },
    { results: permissions.length },
  );
};

// ============================================================================
// WRITE
// ============================================================================

/**
 * Replaces all roles for a user in the current tenant (full replace via transaction).
 * Requires at least one roleId in the payload.
 *
 * @route PUT /api/memberships/:userId/roles
 */
export const replaceMembershipRoles = async (c: Context<AppBindings>) => {
  const { userId } = getValidatedParams<MembershipUserIdParam>(c);
  const { roleIds } = getValidatedBody<AssignRolesToUserInput>(c);
  const tenantId = c.get("currentTenantId")!;

  await resolveMembership(userId, tenantId);

  const roles = await prisma.role.findMany({
    where: {
      id: { in: roleIds },
      OR: [{ tenantId }, { tenantId: null }],
    },
  });

  if (roles.length !== roleIds.length) {
    throw new BadRequestError("Uno o più ruoli non sono validi o non appartengono al tenant");
  }

  const updated = await prisma.$transaction(async (tx) => {
    return tx.userTenantMembership.update({
      where: { userId_tenantId: { userId, tenantId } },
      data: {
        roles: {
          deleteMany: {},
          create: roleIds.map((roleId: number) => ({ roleId })),
        },
      },
      include: {
        roles: {
          select: {
            role: { select: { id: true, code: true, name: true, description: true } },
          },
        },
      },
    });
  });

  return sendSuccess(
    c,
    { userId, membershipId: updated.id, roles: updated.roles.map((r) => r.role) },
    { message: "Ruoli aggiornati con successo" },
  );
};

/**
 * Adds roles to a user's membership without removing existing ones.
 * Skips already-assigned roles (no conflict error).
 *
 * @route POST /api/memberships/:userId/roles
 */
export const addMembershipRoles = async (c: Context<AppBindings>) => {
  const { userId } = getValidatedParams<MembershipUserIdParam>(c);
  const { roleIds } = getValidatedBody<AssignRolesToUserInput>(c);
  const tenantId = c.get("currentTenantId")!;

  const membership = await resolveMembership(userId, tenantId);

  const roles = await prisma.role.findMany({
    where: {
      id: { in: roleIds },
      OR: [{ tenantId }, { tenantId: null }],
    },
  });

  if (roles.length !== roleIds.length) {
    throw new BadRequestError("Uno o più ruoli non sono validi o non appartengono al tenant");
  }

  await prisma.userTenantMembershipRole.createMany({
    data: roleIds.map((roleId: number) => ({
      membershipId: membership.id,
      roleId,
    })),
    skipDuplicates: true,
  });

  const updated = await resolveMembership(userId, tenantId);
  const updatedRoles = updated.roles.map((r) => r.role);

  return sendSuccess(
    c,
    { userId, membershipId: membership.id, roles: updatedRoles },
    { message: "Ruoli aggiunti con successo" },
  );
};

/**
 * Removes specific roles from a user's membership.
 * Prevents removing all roles — at least one must remain.
 *
 * @route DELETE /api/memberships/:userId/roles
 */
export const removeMembershipRoles = async (c: Context<AppBindings>) => {
  const { userId } = getValidatedParams<MembershipUserIdParam>(c);
  const { roleIds } = getValidatedBody<RemoveRolesFromUserInput>(c);
  const tenantId = c.get("currentTenantId")!;

  const membership = await resolveMembership(userId, tenantId);
  const currentRoleIds = membership.roles.map((r) => r.roleId);
  const remaining = currentRoleIds.filter((id) => !roleIds.includes(id));

  if (remaining.length === 0) {
    throw new BadRequestError(
      "Impossibile rimuovere tutti i ruoli. L'utente deve mantenere almeno un ruolo nel tenant.",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.userTenantMembershipRole.deleteMany({
      where: {
        membershipId: membership.id,
        roleId: { in: roleIds },
      },
    });
  });

  return sendSuccess(
    c,
    {
      userId,
      membershipId: membership.id,
      removedRoleIds: roleIds,
      remainingCount: remaining.length,
    },
    { message: "Ruoli rimossi con successo" },
  );
};
