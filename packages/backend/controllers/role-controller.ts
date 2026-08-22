import { NotFoundError, BadRequestError, ConflictError } from "../utils/app-error-utils";
import { prisma } from "../config/prisma-config";
import { Prisma } from "../generated/prisma/client";
import {
  AssignPermissionsInput,
  CreatePermissionInput,
  CreateRoleInput,
  PermissionQueryInput,
  RoleCodeParam,
  RoleIdParam,
  RoleQueryInput,
  UpdatePermissionInput,
  UpdateRoleInput,
} from "@mini-erp/shared";
import { buildPagination } from "@/utils/query-utils";
import {
  sendCreated,
  sendDeleted,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response-utils";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import {
  formatPermissionRoles,
  formatRolePermissions,
  getPermissionSelection,
  getRoleSelect,
} from "@/helpers/role-helper";
import { syncPermissionsService } from "@/services/role";
import { invalidatePermissionsCacheForRole } from "@/helpers/user-helper";

// ============================================================================
// ROLES - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i ruoli con filtri
 * @route   GET /api/roles
 * @access  Private/Admin
 */
export const getAllRoles = async (c: Context<AppBindings>) => {
  const {
    search,
    isDefault,
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    limit = 20,
  } = getValidatedQuery<RoleQueryInput>(c);

  const tenantId = c.get("currentTenantId")!;

  // Costruisci filtri dinamici
  const where: Prisma.RoleWhereInput = {
    AND: [
      {
        OR: [{ tenantId: tenantId }, { tenantId: null }],
      },
    ],
  };

  const { skip, take } = buildPagination(Number(page), Number(limit));

  if (search) {
    (where.AND as Prisma.RoleWhereInput[]).push({
      OR: [
        { code: { contains: search as string, mode: "insensitive" } },
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ],
    });
  }

  if (isDefault !== undefined) {
    where.isDefault = isDefault;
  }

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      skip,
      take,
      select: getRoleSelect(tenantId),
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.role.count({ where }),
  ]);

  const formattedRoles = roles.map(formatRolePermissions);

  return sendPaginatedResponse(c, formattedRoles, total, page, limit);
};

/**
 * @desc    Ottieni dettagli ruolo per ID
 * @route   GET /api/roles/:id
 * @access  Private/Admin
 */
export const getRoleById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);
  const tenantId = c.get("currentTenantId")!;

  const role = await prisma.role.findFirst({
    where: {
      id,
      AND: [
        {
          OR: [{ tenantId: tenantId }, { tenantId: null }],
        },
      ],
    },
    select: getRoleSelect(tenantId),
  });

  if (!role) {
    throw new NotFoundError("Ruolo non trovato");
  }

  if (role) {
    // Ordina i permessi in memoria prima di mandarli al client
    role.permissions.sort((a, b) =>
      (a.permission?.resource || "").localeCompare(b.permission?.resource || ""),
    );
  }

  return sendSuccess(c, formatRolePermissions(role));
};

/**
 * @desc    Ottieni dettagli ruolo per codice
 * @route   GET /api/roles/code/:code
 * @access  Private/Admin
 */
export const getRoleByCode = async (c: Context<AppBindings>) => {
  const { code } = getValidatedParams<RoleCodeParam>(c);
  const tenantId = c.get("currentTenantId")!;

  const role = await prisma.role.findFirst({
    where: {
      code: code.toUpperCase(),
      OR: [{ tenantId: tenantId }, { tenantId: null }],
    },
    select: getRoleSelect(tenantId),
  });

  if (!role) {
    throw new NotFoundError("Ruolo non trovato");
  }

  return sendSuccess(c, formatRolePermissions(role));
};

/**
 * @desc    Crea un nuovo ruolo
 * @route   POST /api/roles
 * @access  Private/Admin
 */
export const createRole = async (c: Context<AppBindings>) => {
  const { permissionIds, ...roleData } = getValidatedBody<CreateRoleInput>(c);
  const tenantId = c.get("currentTenantId")!;

  // Verifica unicità code
  const existingRole = await prisma.role.findFirst({
    where: {
      code: roleData.code,
      OR: [{ tenantId: tenantId }, { tenantId: null }],
    },
  });

  if (existingRole) {
    throw new ConflictError("Codice ruolo già esistente");
  }

  // Se isDefault è true, rimuovi il flag da altri ruoli
  if (roleData.isDefault) {
    await prisma.role.updateMany({
      where: { isDefault: true, tenantId },
      data: { isDefault: false },
    });
  }

  // Crea ruolo con permessi
  const role = await prisma.role.create({
    data: {
      ...roleData,
      tenantId,
      permissions: permissionIds?.length
        ? {
            create: permissionIds.map((permissionId: number) => ({
              permissionId,
            })),
          }
        : undefined,
    },
    select: getRoleSelect(tenantId),
  });

  return sendSuccess(c, formatRolePermissions(role), {
    message: "Ruolo creato con successo",
  });
};

/**
 * @desc    Aggiorna un ruolo
 * @route   PUT /api/roles/:id
 * @access  Private/Admin
 */
export const updateRole = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);
  const { permissionIds, ...updateData } = getValidatedBody<UpdateRoleInput>(c);
  const tenantId = c.get("currentTenantId")!;

  // Verifica esistenza
  const existingRole = await prisma.role.findFirst({
    where: { id: Number(id), OR: [{ tenantId }, { tenantId: null }] },
  });

  if (!existingRole) {
    throw new NotFoundError("Ruolo non trovato");
  }

  // Verifica unicità code se modificato
  if (updateData.code && updateData.code !== existingRole.code) {
    const duplicateCode = await prisma.role.findFirst({
      where: { code: updateData.code, OR: [{ tenantId }, { tenantId: null }] },
    });

    if (duplicateCode) {
      throw new ConflictError("Codice ruolo già esistente");
    }
  }

  // Se isDefault è true, rimuovi il flag da altri ruoli
  if (updateData.isDefault === true) {
    await prisma.role.updateMany({
      where: { isDefault: true, id: { not: Number(id) }, OR: [{ tenantId }, { tenantId: null }] },
      data: { isDefault: false },
    });
  }

  // Aggiorna ruolo
  const role = await prisma.role.update({
    where: { id: Number(id) },
    data: {
      ...updateData,
      permissions: permissionIds?.length
        ? {
            deleteMany: {}, // cancella tutte le entry della tabella pivot per quel role
            create: permissionIds.map((permissionId: number) => ({
              permissionId,
            })),
          }
        : {
            // se vuoi semplicemente rimuovere tutti i permessi quando l’array è vuoto
            deleteMany: {},
          },
    },
    select: getRoleSelect(tenantId),
  });

  // Reset user cache
  await invalidatePermissionsCacheForRole(Number(id));

  return sendSuccess(c, formatRolePermissions(role), {
    message: "Ruolo aggiornato con successo",
  });
};

/**
 * @desc    Elimina un ruolo
 * @route   DELETE /api/roles/:id
 * @access  Private/Admin
 */
export const deleteRole = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);
  const tenantId = c.get("currentTenantId");

  const role = await prisma.role.findFirst({
    where: { id: Number(id), OR: [{ tenantId }, { tenantId: null }] },
    include: {
      _count: {
        select: { usersTenantMembershipRoles: true },
      },
    },
  });

  if (!role) {
    throw new NotFoundError("Ruolo non trovato");
  }

  if (role.tenantId === null) {
    throw new BadRequestError("Impossibile rimuovere un ruolo di sistema");
  }

  // Verifica che non ci siano utenti assegnati
  if (role._count.usersTenantMembershipRoles > 0) {
    throw new BadRequestError(
      `Impossibile eliminare il ruolo. Ci sono ${role._count.usersTenantMembershipRoles} utenti assegnati.`,
    );
  }

  // Non permettere eliminazione del ruolo default
  if (role.isDefault) {
    throw new BadRequestError("Impossibile eliminare il ruolo di default");
  }

  // Elimina ruolo
  await prisma.role.delete({
    where: { id: Number(id) },
  });

  return sendDeleted(c, "Ruolo eliminato");
};

// ============================================================================
// ROLE PERMISSIONS Management
// ============================================================================

/**
 * @desc    Lista permessi di un ruolo
 * @route   GET /api/roles/:id/permissions
 * @access  Private/Admin
 */
export const getRolePermissions = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);

  const role = await prisma.role.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      code: true,
      name: true,
      permissions: {
        select: {
          permission: true,
        },
      },
    },
  });

  if (!role) {
    throw new NotFoundError("Ruolo non trovato");
  }

  const permissions = role.permissions.map((rp) => rp.permission);

  return sendSuccess(
    c,
    {
      role: {
        id: role.id,
        code: role.code,
        name: role.name,
      },
      permissions,
    },
    {
      results: permissions.length,
    },
  );
};

/**
 * @desc    Assegna permessi a un ruolo
 * @route   POST /api/roles/:id/permissions
 * @access  Private/Admin
 */
export const assignPermissionsToRole = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);
  const { permissionIds } = getValidatedBody<AssignPermissionsInput>(c);
  const tenantId = c.get("currentTenantId")!;

  // Verifica esistenza ruolo
  const role = await prisma.role.findFirst({
    where: { id: Number(id), OR: [{ tenantId }, { tenantId: null }] },
  });

  if (!role) {
    throw new NotFoundError("Ruolo non trovato");
  }

  // Verifica esistenza permessi
  const permissions = await prisma.permission.findMany({
    where: { id: { in: permissionIds } },
  });

  if (permissions.length !== permissionIds.length) {
    throw new BadRequestError("Uno o più permessi non sono validi");
  }

  // Aggiungi permessi (ignora duplicati)
  await prisma.rolePermission.createMany({
    data: permissionIds.map((permissionId: number) => ({
      roleId: Number(id),
      permissionId,
    })),
    skipDuplicates: true,
  });

  // Reset user cache
  await invalidatePermissionsCacheForRole(Number(id));

  // Ricarica ruolo con permessi aggiornati
  const updatedRole = await prisma.role.findUnique({
    where: { id: Number(id) },
    select: getRoleSelect(tenantId),
  });

  return sendSuccess(c, formatRolePermissions(updatedRole), {
    message: "Permessi assegnati con successo",
  });
};

/**
 * @desc    Rimuovi permessi da un ruolo
 * @route   DELETE /api/roles/:id/permissions
 * @access  Private/Admin
 */
export const removePermissionsFromRole = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);
  const { permissionIds } = getValidatedBody<AssignPermissionsInput>(c);
  const tenantId = c.get("currentTenantId")!;

  // Verifica esistenza ruolo
  const role = await prisma.role.findUnique({
    where: { id: Number(id) },
  });

  if (!role) {
    throw new NotFoundError("Ruolo non trovato");
  }

  // Rimuovi permessi
  await prisma.rolePermission.deleteMany({
    where: {
      roleId: Number(id),
      permissionId: { in: permissionIds },
    },
  });

  // Reset user cache
  await invalidatePermissionsCacheForRole(Number(id));

  // Ricarica ruolo con permessi aggiornati
  const updatedRole = await prisma.role.findUnique({
    where: { id: Number(id) },
    select: getRoleSelect(tenantId),
  });

  return sendSuccess(c, formatRolePermissions(updatedRole), {
    message: "Permessi rimossi con successo",
  });
};

/**
 * @desc    Lista utenti con questo ruolo
 * @route   GET /api/roles/:id/users
 * @access  Private/Admin
 */
export const getRoleUsers = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);
  const tenantId = c.get("currentTenantId");

  const role = await prisma.role.findUnique({
    where: { id: Number(id), tenantId },
    include: {
      usersTenantMembershipRoles: {
        select: {
          membership: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  active: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!role) {
    throw new NotFoundError("Ruolo non trovato");
  }

  return sendSuccess(
    c,
    {
      role: {
        id: role.id,
        code: role.code,
        name: role.name,
      },
      users: role.usersTenantMembershipRoles,
    },
    {
      results: role.usersTenantMembershipRoles.length,
    },
  );
};

// ============================================================================
// PERMISSIONS - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i permessi con filtri
 * @route   GET /api/roles/permissions
 * @access  Private/Admin
 */
export const getAllPermissions = async (c: Context<AppBindings>) => {
  const {
    search,
    resource,
    action,
    sortBy = "resource",
    sortOrder = "asc",
  } = getValidatedQuery<PermissionQueryInput>(c);

  // Costruisci filtri dinamici
  const where: Prisma.PermissionWhereInput = {};

  if (search) {
    where.OR = [
      { code: { contains: search as string, mode: "insensitive" } },
      { resource: { contains: search as string, mode: "insensitive" } },
      { action: { contains: search as string, mode: "insensitive" } },
      { description: { contains: search as string, mode: "insensitive" } },
    ];
  }

  if (resource) {
    where.resource = { contains: resource as string, mode: "insensitive" };
  }

  if (action) {
    where.action = { contains: action as string, mode: "insensitive" };
  }

  const permissions = await prisma.permission.findMany({
    where,
    select: getPermissionSelection(),
    orderBy: { [sortBy as string]: sortOrder },
  });

  const formattedPermissions = permissions.map(formatPermissionRoles);

  return sendSuccess(c, formattedPermissions, {
    results: formattedPermissions.length,
  });
};

/**
 * @desc    Ottieni dettagli permesso
 * @route   GET /api/roles/permissions/:id
 * @access  Private/Admin
 */
export const getPermissionById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);

  const permission = await prisma.permission.findUnique({
    where: { id: Number(id) },
    select: getPermissionSelection(),
  });

  if (!permission) {
    throw new NotFoundError("Permesso non trovato");
  }

  return sendSuccess(c, formatPermissionRoles(permission));
};

/**
 * @desc    Crea un nuovo permesso
 * @route   POST /api/roles/permissions
 * @access  Private/Admin
 */
export const createPermission = async (c: Context<AppBindings>) => {
  const permissionData = getValidatedBody<CreatePermissionInput>(c);

  // Verifica unicità code
  const existingPermission = await prisma.permission.findUnique({
    where: { code: permissionData.code },
  });

  if (existingPermission) {
    throw new ConflictError("Codice permesso già esistente");
  }

  // Crea permesso
  const permission = await prisma.permission.create({
    data: permissionData,
    select: getPermissionSelection(),
  });

  return sendCreated(c, formatPermissionRoles(permission), "Permesso creato con successo");
};

/**
 * @desc    Aggiorna un permesso
 * @route   PUT /api/roles/permissions/:id
 * @access  Private/Admin
 */
export const updatePermission = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);
  const updateData = getValidatedBody<UpdatePermissionInput>(c);

  // Verifica esistenza
  const existingPermission = await prisma.permission.findUnique({
    where: { id: Number(id) },
  });

  if (!existingPermission) {
    throw new NotFoundError("Permesso non trovato");
  }

  // Verifica unicità code se modificato
  if (updateData.code && updateData.code !== existingPermission.code) {
    const duplicateCode = await prisma.permission.findUnique({
      where: { code: updateData.code },
    });

    if (duplicateCode) {
      throw new ConflictError("Codice permesso già esistente");
    }
  }

  // Aggiorna permesso
  const permission = await prisma.permission.update({
    where: { id: Number(id) },
    data: updateData,
    select: getPermissionSelection(),
  });

  return sendSuccess(c, formatPermissionRoles(permission), {
    message: "Permesso aggiornato con successo",
  });
};

/**
 * @desc    Elimina un permesso
 * @route   DELETE /api/roles/permissions/:id
 * @access  Private/Admin
 */
export const deletePermission = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);

  const permission = await prisma.permission.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: { roles: true },
      },
    },
  });

  if (!permission) {
    throw new NotFoundError("Permesso non trovato");
  }

  // Avviso se ci sono ruoli assegnati
  if (permission._count.roles > 0) {
    throw new BadRequestError(
      `Il permesso è assegnato a ${permission._count.roles} ruoli. Rimuovilo prima dai ruoli.`,
    );
  }

  // Elimina permesso
  await prisma.permission.delete({
    where: { id: Number(id) },
  });

  return sendDeleted(c, "Permesso eliminato");
};

/**
 * @desc    Lista ruoli che hanno questo permesso
 * @route   GET /api/roles/permissions/:id/roles
 * @access  Private/Admin
 */
export const getPermissionRoles = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<RoleIdParam>(c);

  const permission = await prisma.permission.findUnique({
    where: { id: Number(id) },
    include: {
      roles: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!permission) {
    throw new NotFoundError("Permesso non trovato");
  }

  const roles = permission.roles.map((rp) => rp.role);

  return sendSuccess(
    c,
    {
      permission: {
        id: permission.id,
        code: permission.code,
        resource: permission.resource,
        action: permission.action,
      },
      roles,
    },
    {
      results: roles.length,
    },
  );
};

/**
 * Synchronizes permissions from source code to the database.
 *
 * @param c - Hono request context.
 * @returns HTTP response with synchronization details.
 */
export const syncPermissions = async (c: Context<AppBindings>): Promise<Response> => {
  const result = await syncPermissionsService();

  return sendSuccess(c, result, {
    message: "Sincronizzazione completata",
  });
};
