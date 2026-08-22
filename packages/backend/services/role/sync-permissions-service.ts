// packages/backend/services/role/sync-permissions-service.ts

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { defaultPermissions } from "@/helpers/role-helper";
import { invalidatePermissionsCacheForRole } from "@/helpers/user-helper";

export interface SyncPermissionsResult {
  permissions: {
    created: number;
    updated: number;
    skipped: number;
    adminAssigned: number;
    superAdminAssigned: number;
  };
  roles: {
    admin: {
      newlyAssigned: number;
      totalAssigned: number;
    };
    superAdmin: {
      newlyAssigned: number;
      totalAssigned: number;
    };
    totalPermissionsInDatabase: number;
    defaultPermissionsProcessed: number;
  };
}

/**
 * Finds or creates a role by code and assigns all missing permissions to it.
 *
 * @param tx - Prisma transaction client.
 * @param code - Role code.
 * @param name - Role display name used on creation only.
 * @param description - Role description used on creation only.
 * @param permissionIds - Permission IDs to ensure on the role.
 * @returns Newly assigned permissions and total assigned permissions.
 */
async function syncRolePermissions(
  tx: Prisma.TransactionClient,
  code: string,
  name: string,
  description: string,
  permissionIds: number[],
): Promise<{ newlyAssigned: number; totalAssigned: number }> {
  let role = await tx.role.findUnique({
    where: { code },
    include: {
      permissions: {
        select: {
          permissionId: true,
        },
      },
    },
  });

  if (!role) {
    role = await tx.role.create({
      data: {
        code,
        name,
        description,
        isDefault: false,
      },
      include: {
        permissions: {
          select: {
            permissionId: true,
          },
        },
      },
    });
  }

  const existingPermissionIds = new Set(
    role.permissions.map((permission) => permission.permissionId),
  );

  const uniquePermissionIds = [...new Set(permissionIds)];
  const missingPermissionIds = uniquePermissionIds.filter(
    (permissionId) => !existingPermissionIds.has(permissionId),
  );

  if (missingPermissionIds.length > 0) {
    await tx.rolePermission.createMany({
      data: missingPermissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }

  const totalAssigned = await tx.rolePermission.count({
    where: {
      roleId: role.id,
    },
  });

  return {
    newlyAssigned: missingPermissionIds.length,
    totalAssigned,
  };
}

/**
 * Synchronizes default permissions into the database and ensures that
 * ADMIN and SUPER_ADMIN have every permission currently stored in the database.
 *
 * @returns Detailed synchronization result.
 */
export async function syncPermissionsService(): Promise<SyncPermissionsResult> {
  return prisma.$transaction(async (tx) => {
    const result: SyncPermissionsResult = {
      permissions: {
        created: 0,
        updated: 0,
        skipped: 0,
        adminAssigned: 0,
        superAdminAssigned: 0,
      },
      roles: {
        admin: {
          newlyAssigned: 0,
          totalAssigned: 0,
        },
        superAdmin: {
          newlyAssigned: 0,
          totalAssigned: 0,
        },
        totalPermissionsInDatabase: 0,
        defaultPermissionsProcessed: defaultPermissions.length,
      },
    };

    for (const permission of defaultPermissions) {
      const existingPermission = await tx.permission.findUnique({
        where: {
          code: permission.code,
        },
      });

      if (!existingPermission) {
        await tx.permission.create({
          data: permission,
        });
        result.permissions.created += 1;
        continue;
      }

      const mustUpdate =
        existingPermission.description !== permission.description ||
        existingPermission.resource !== permission.resource ||
        existingPermission.action !== permission.action;

      if (!mustUpdate) {
        result.permissions.skipped += 1;
        continue;
      }

      await tx.permission.update({
        where: {
          id: existingPermission.id,
        },
        data: {
          description: permission.description,
          resource: permission.resource,
          action: permission.action,
        },
      });

      result.permissions.updated += 1;
    }

    const allPermissions = await tx.permission.findMany({
      select: {
        id: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const allPermissionIds = allPermissions.map((permission) => permission.id);

    result.roles.totalPermissionsInDatabase = allPermissionIds.length;

    const adminSync = await syncRolePermissions(
      tx,
      "ADMIN",
      "Amministratore",
      "Accesso completo alle funzionalità del tenant corrente",
      allPermissionIds,
    );

    result.permissions.adminAssigned = adminSync.newlyAssigned;
    result.roles.admin = adminSync;

    const superAdminSync = await syncRolePermissions(
      tx,
      "SUPER_ADMIN",
      "Super Amministratore",
      "Accesso completo a tutte le funzionalità su tutti i tenant",
      allPermissionIds,
    );

    result.permissions.superAdminAssigned = superAdminSync.newlyAssigned;
    result.roles.superAdmin = superAdminSync;

    // Invalida cache di tutti gli utenti ADMIN e SUPER_ADMIN dopo la sync
    const adminRole = await prisma.role.findUnique({ where: { code: "ADMIN" } });
    const superAdminRole = await prisma.role.findUnique({ where: { code: "SUPER_ADMIN" } });

    await Promise.all(
      [
        adminRole && invalidatePermissionsCacheForRole(adminRole.id),
        superAdminRole && invalidatePermissionsCacheForRole(superAdminRole.id),
      ].filter(Boolean),
    );

    return result;
  });
}
