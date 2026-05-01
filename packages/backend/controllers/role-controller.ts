import { NotFoundError, BadRequestError, ConflictError } from "../utils/app-error-utils";
import { prisma } from "../config/prisma-config";
import { Prisma } from "../generated/prisma/client";
import {
  AssignPermissionsInput,
  AssignRolesToUserInput,
  CheckUserPermissionInput,
  CreatePermissionInput,
  CreateRoleInput,
  PermissionIdParam,
  PermissionQueryInput,
  RoleCodeParam,
  RoleIdParam,
  RoleQueryInput,
  UpdatePermissionInput,
  UpdateRoleInput,
  UserIdAsUserIdParam,
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
  defaultPermissions,
  formatPermissionRoles,
  formatRolePermissions,
  getPermissionSelection,
  roleSelect,
} from "@/helpers/role-helper";

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

  // Costruisci filtri dinamici
  const where: Prisma.RoleWhereInput = {};

  const { skip, take } = buildPagination(Number(page), Number(limit));

  if (search) {
    where.OR = [
      { code: { contains: search as string, mode: "insensitive" } },
      { name: { contains: search as string, mode: "insensitive" } },
      { description: { contains: search as string, mode: "insensitive" } },
    ];
  }

  if (isDefault !== undefined) {
    where.isDefault = isDefault;
  }

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      skip,
      take,
      select: roleSelect,
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

  const role = await prisma.role.findUnique({
    where: { id: Number(id) },
    select: roleSelect,
  });

  if (!role) {
    throw new NotFoundError("Ruolo non trovato");
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

  const role = await prisma.role.findUnique({
    where: { code: code.toUpperCase() },
    select: roleSelect,
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

  // Verifica unicità code
  const existingRole = await prisma.role.findUnique({
    where: { code: roleData.code },
  });

  if (existingRole) {
    throw new ConflictError("Codice ruolo già esistente");
  }

  // Se isDefault è true, rimuovi il flag da altri ruoli
  if (roleData.isDefault) {
    await prisma.role.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  // Crea ruolo con permessi
  const role = await prisma.role.create({
    data: {
      ...roleData,
      permissions: permissionIds?.length
        ? {
            create: permissionIds.map((permissionId: number) => ({
              permissionId,
            })),
          }
        : undefined,
    },
    select: roleSelect,
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

  // Verifica esistenza
  const existingRole = await prisma.role.findUnique({
    where: { id: Number(id) },
  });

  if (!existingRole) {
    throw new NotFoundError("Ruolo non trovato");
  }

  // Verifica unicità code se modificato
  if (updateData.code && updateData.code !== existingRole.code) {
    const duplicateCode = await prisma.role.findUnique({
      where: { code: updateData.code },
    });

    if (duplicateCode) {
      throw new ConflictError("Codice ruolo già esistente");
    }
  }

  // Se isDefault è true, rimuovi il flag da altri ruoli
  if (updateData.isDefault === true) {
    await prisma.role.updateMany({
      where: { isDefault: true, id: { not: Number(id) } },
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
    select: roleSelect,
  });

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

  const role = await prisma.role.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  if (!role) {
    throw new NotFoundError("Ruolo non trovato");
  }

  // Verifica che non ci siano utenti assegnati
  if (role._count.users > 0) {
    throw new BadRequestError(
      `Impossibile eliminare il ruolo. Ci sono ${role._count.users} utenti assegnati.`,
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

  // Verifica esistenza ruolo
  const role = await prisma.role.findUnique({
    where: { id: Number(id) },
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

  // Ricarica ruolo con permessi aggiornati
  const updatedRole = await prisma.role.findUnique({
    where: { id: Number(id) },
    select: roleSelect,
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

  // Ricarica ruolo con permessi aggiornati
  const updatedRole = await prisma.role.findUnique({
    where: { id: Number(id) },
    select: roleSelect,
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

  const role = await prisma.role.findUnique({
    where: { id: Number(id) },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          email: true,
          active: true,
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
      users: role.users,
    },
    {
      results: role.users.length,
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

// ============================================================================
// USER ROLE MANAGEMENT
// ============================================================================

/**
 * @desc    Assegna ruoli a un utente
 * @route   POST /api/roles/users/assign
 * @access  Private/Admin
 */
export const assignRolesToUser = async (c: Context<AppBindings>) => {
  const { userId, roleIds } = getValidatedBody<AssignRolesToUserInput>(c);

  // Verifica esistenza utente
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  // Verifica esistenza ruoli
  const roles = await prisma.role.findMany({
    where: { id: { in: roleIds } },
  });

  if (roles.length !== roleIds.length) {
    throw new BadRequestError("Uno o più ruoli non sono validi");
  }

  // Assegna ruoli
  await prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        connect: roleIds.map((id: number) => ({ id })),
      },
    },
  });

  // Ricarica utente con ruoli
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      roles: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return sendSuccess(c, updatedUser, {
    message: "Ruoli assegnati con successo",
  });
};

/**
 * @desc    Rimuovi ruoli da un utente
 * @route   POST /api/roles/users/remove
 * @access  Private/Admin
 */
export const removeRolesFromUser = async (c: Context<AppBindings>) => {
  const { userId, roleIds } = getValidatedBody<AssignRolesToUserInput>(c);

  // Verifica esistenza utente
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  // Verifica che non si rimuovano tutti i ruoli
  const remainingRoles = user.roles.filter((role) => !roleIds.includes(role.id));
  if (remainingRoles.length === 0) {
    throw new BadRequestError("Impossibile rimuovere tutti i ruoli. Almeno un ruolo è richiesto.");
  }

  // Rimuovi ruoli
  await prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        disconnect: roleIds.map((id: number) => ({ id })),
      },
    },
  });

  // Ricarica utente con ruoli
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      roles: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return sendSuccess(c, updatedUser, {
    message: "Ruoli rimossi con successo",
  });
};

/**
 * @desc    Lista ruoli di un utente
 * @route   GET /api/roles/users/:userId/roles
 * @access  Private/Admin
 */
export const getUserRoles = async (c: Context<AppBindings>) => {
  const { userId } = getValidatedParams<UserIdAsUserIdParam>(c);

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      username: true,
      email: true,
      roles: {
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  return sendSuccess(c, user, {
    results: user.roles.length,
  });
};

/**
 * @desc    Lista tutti i permessi di un utente (tramite ruoli)
 * @route   GET /api/roles/users/:userId/permissions
 * @access  Private/Admin
 */
export const getUserPermissions = async (c: Context<AppBindings>) => {
  const { userId } = getValidatedParams<UserIdAsUserIdParam>(c);

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: {
      roles: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  // Estrai permessi unici da tutti i ruoli
  const permissionsMap = new Map();
  user.roles.forEach((role) => {
    role.permissions.forEach((rp) => {
      permissionsMap.set(rp.permission.id, rp.permission);
    });
  });

  const permissions = Array.from(permissionsMap.values());

  return sendSuccess(
    c,
    {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      permissions,
    },
    {
      results: permissions.length,
    },
  );
};

/**
 * @desc    Verifica se un utente ha un permesso specifico
 * @route   POST /api/roles/users/check-permission
 * @access  Private/Admin
 */
export const checkUserPermission = async (c: Context<AppBindings>) => {
  const { userId, permissionCode } = getValidatedBody<CheckUserPermissionInput>(c);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  // Verifica se l'utente ha il permesso
  const hasPermission = user.roles.some((role) =>
    role.permissions.some((rp) => rp.permission.code === permissionCode),
  );

  return sendSuccess(c, {
    userId,
    permissionCode,
    hasPermission,
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * @desc    Sincronizza permessi dal codice al database
 * @route   POST /api/roles/sync-permissions
 * @access  Private/Admin
 */
export const syncPermissions = async (c: Context<AppBindings>) => {
  // Lista di permessi predefiniti da sincronizzare

  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    adminAssigned: 0,
  };

  // Array per tracciare tutti gli ID dei permessi (esistenti + nuovi)
  const allPermissionIds: number[] = [];

  // Sincronizza ogni permesso
  for (const permission of defaultPermissions) {
    const existing = await prisma.permission.findUnique({
      where: { code: permission.code },
    });

    if (existing) {
      // Traccia l'ID
      allPermissionIds.push(existing.id);

      // Aggiorna se necessario
      if (
        existing.description !== permission.description ||
        existing.resource !== permission.resource ||
        existing.action !== permission.action
      ) {
        await prisma.permission.update({
          where: { id: existing.id },
          data: {
            description: permission.description,
            resource: permission.resource,
            action: permission.action,
          },
        });
        results.updated++;
      } else {
        results.skipped++;
      }
    } else {
      // Crea nuovo permesso
      const newPermission = await prisma.permission.create({
        data: permission,
      });
      allPermissionIds.push(newPermission.id);
      results.created++;
    }
  }

  // ============================================================================
  // ASSEGNA TUTTI I PERMESSI AL RUOLO ADMIN
  // ============================================================================

  // Trova o crea il ruolo ADMIN
  let adminRole = await prisma.role.findUnique({
    where: { code: "ADMIN" },
    include: {
      permissions: {
        select: { permissionId: true },
      },
    },
  });

  if (!adminRole) {
    // Crea ruolo ADMIN se non esiste
    adminRole = await prisma.role.create({
      data: {
        code: "ADMIN",
        name: "Amministratore",
        description: "Accesso completo a tutte le funzionalità del sistema",
        isDefault: false,
      },
      include: {
        permissions: {
          select: { permissionId: true },
        },
      },
    });
  }

  // Ottieni gli ID dei permessi già assegnati
  const existingPermissionIds = adminRole.permissions.map((p) => p.permissionId);

  // Trova i permessi da assegnare (nuovi permessi non ancora assegnati)
  const permissionsToAssign = allPermissionIds.filter((id) => !existingPermissionIds.includes(id));

  // Assegna i nuovi permessi al ruolo ADMIN
  if (permissionsToAssign.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissionsToAssign.map((permissionId) => ({
        roleId: adminRole.id,
        permissionId,
      })),
      skipDuplicates: true,
    });
    results.adminAssigned = permissionsToAssign.length;
  }

  sendSuccess(
    c,
    {
      permissions: results,
      adminRole: {
        id: adminRole.id,
        code: adminRole.code,
        name: adminRole.name,
        totalPermissions: allPermissionIds.length,
        newlyAssigned: results.adminAssigned,
      },
    },
    {
      message: "Sincronizzazione completata",
    },
  );
};
