import { Response } from "express";
import asyncHandler from "../middleware/async-handler";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/app-error";
import { prisma } from "../config/prisma-client";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedValidatedRequest } from "../types/validate";
import { RoleQueryInput, UpdateRoleInput } from "@mini-erp/shared";
import { buildPagination } from "@/utils/query";
import { sendPaginatedResponse, sendSuccess } from "@/utils/response";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Selezione standard per Role con relazioni
 */
export const roleSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
  permissions: {
    select: {
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
  _count: {
    select: {
      users: true,
    },
  },
} satisfies Prisma.RoleSelect;

/**
 * Selezione standard per Permission con relazioni
 */
const getPermissionSelection = () => ({
  id: true,
  code: true,
  resource: true,
  action: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  roles: {
    select: {
      role: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  },
});

/**
 * Formatta i permessi per la risposta
 */
const formatRolePermissions = (role: any) => {
  return {
    ...role,
    permissions: role.permissions?.map((rp: any) => rp.permission) || [],
    userCount: role._count?.users || 0,
  };
};

/**
 * Formatta i ruoli per la risposta
 */
const formatPermissionRoles = (permission: any) => {
  return {
    ...permission,
    roles: permission.roles?.map((rp: any) => rp.role) || [],
  };
};

// ============================================================================
// ROLES - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i ruoli con filtri
 * @route   GET /api/roles
 * @access  Private/Admin
 */
export const getAllRoles = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const {
      search,
      isDefault,
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      limit = 20,
    } = req.validatedQuery as RoleQueryInput;

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

    sendPaginatedResponse(res, formattedRoles, total, page, limit);
  },
);

/**
 * @desc    Ottieni dettagli ruolo per ID
 * @route   GET /api/roles/:id
 * @access  Private/Admin
 */
export const getRoleById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      select: roleSelect,
    });

    if (!role) {
      throw new NotFoundError("Ruolo non trovato");
    }

    res.json({
      status: "success",
      data: formatRolePermissions(role),
    });
  },
);

/**
 * @desc    Ottieni dettagli ruolo per codice
 * @route   GET /api/roles/code/:code
 * @access  Private/Admin
 */
export const getRoleByCode = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { code } = req.validatedParams;

    const role = await prisma.role.findUnique({
      where: { code: code.toUpperCase() },
      select: roleSelect,
    });

    if (!role) {
      throw new NotFoundError("Ruolo non trovato");
    }

    res.json({
      status: "success",
      data: formatRolePermissions(role),
    });
  },
);

/**
 * @desc    Crea un nuovo ruolo
 * @route   POST /api/roles
 * @access  Private/Admin
 */
export const createRole = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { permissionIds, ...roleData } = req.validatedBody;

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

    sendSuccess(res, formatRolePermissions(role), {
      message: "Ruolo creato con successo",
    });
  },
);

/**
 * @desc    Aggiorna un ruolo
 * @route   PUT /api/roles/:id
 * @access  Private/Admin
 */
export const updateRole = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const { permissionIds, ...updateData } = req.validatedBody as UpdateRoleInput;

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

    sendSuccess(res, formatRolePermissions(role), {
      message: "Ruolo aggiornato con successo",
    });
  },
);

/**
 * @desc    Elimina un ruolo
 * @route   DELETE /api/roles/:id
 * @access  Private/Admin
 */
export const deleteRole = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

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

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

// ============================================================================
// ROLE PERMISSIONS Management
// ============================================================================

/**
 * @desc    Lista permessi di un ruolo
 * @route   GET /api/roles/:id/permissions
 * @access  Private/Admin
 */
export const getRolePermissions = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

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

    res.json({
      status: "success",
      results: permissions.length,
      data: {
        role: {
          id: role.id,
          code: role.code,
          name: role.name,
        },
        permissions,
      },
    });
  },
);

/**
 * @desc    Assegna permessi a un ruolo
 * @route   POST /api/roles/:id/permissions
 * @access  Private/Admin
 */
export const assignPermissionsToRole = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const { permissionIds } = req.validatedBody;

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

    res.json({
      status: "success",
      message: "Permessi assegnati con successo",
      data: formatRolePermissions(updatedRole),
    });
  },
);

/**
 * @desc    Rimuovi permessi da un ruolo
 * @route   DELETE /api/roles/:id/permissions
 * @access  Private/Admin
 */
export const removePermissionsFromRole = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const { permissionIds } = req.validatedBody;

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

    res.json({
      status: "success",
      message: "Permessi rimossi con successo",
      data: formatRolePermissions(updatedRole),
    });
  },
);

/**
 * @desc    Lista utenti con questo ruolo
 * @route   GET /api/roles/:id/users
 * @access  Private/Admin
 */
export const getRoleUsers = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

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

    res.json({
      status: "success",
      results: role.users.length,
      data: {
        role: {
          id: role.id,
          code: role.code,
          name: role.name,
        },
        users: role.users,
      },
    });
  },
);

// ============================================================================
// PERMISSIONS - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i permessi con filtri
 * @route   GET /api/roles/permissions
 * @access  Private/Admin
 */
export const getAllPermissions = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { search, resource, action, sortBy = "resource", sortOrder = "asc" } = req.query;

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

    res.json({
      status: "success",
      results: formattedPermissions.length,
      data: formattedPermissions,
    });
  },
);

/**
 * @desc    Ottieni dettagli permesso
 * @route   GET /api/roles/permissions/:id
 * @access  Private/Admin
 */
export const getPermissionById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const permission = await prisma.permission.findUnique({
      where: { id: Number(id) },
      select: getPermissionSelection(),
    });

    if (!permission) {
      throw new NotFoundError("Permesso non trovato");
    }

    res.json({
      status: "success",
      data: formatPermissionRoles(permission),
    });
  },
);

/**
 * @desc    Crea un nuovo permesso
 * @route   POST /api/roles/permissions
 * @access  Private/Admin
 */
export const createPermission = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const permissionData = req.validatedBody;

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

    res.status(201).json({
      status: "success",
      message: "Permesso creato con successo",
      data: formatPermissionRoles(permission),
    });
  },
);

/**
 * @desc    Aggiorna un permesso
 * @route   PUT /api/roles/permissions/:id
 * @access  Private/Admin
 */
export const updatePermission = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const updateData = req.validatedBody;

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

    res.json({
      status: "success",
      message: "Permesso aggiornato con successo",
      data: formatPermissionRoles(permission),
    });
  },
);

/**
 * @desc    Elimina un permesso
 * @route   DELETE /api/roles/permissions/:id
 * @access  Private/Admin
 */
export const deletePermission = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

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

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

/**
 * @desc    Lista ruoli che hanno questo permesso
 * @route   GET /api/roles/permissions/:id/roles
 * @access  Private/Admin
 */
export const getPermissionRoles = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

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

    res.json({
      status: "success",
      results: roles.length,
      data: {
        permission: {
          id: permission.id,
          code: permission.code,
          resource: permission.resource,
          action: permission.action,
        },
        roles,
      },
    });
  },
);

// ============================================================================
// USER ROLE MANAGEMENT
// ============================================================================

/**
 * @desc    Assegna ruoli a un utente
 * @route   POST /api/roles/users/assign
 * @access  Private/Admin
 */
export const assignRolesToUser = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { userId, roleIds } = req.validatedBody;

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

    res.json({
      status: "success",
      message: "Ruoli assegnati con successo",
      data: updatedUser,
    });
  },
);

/**
 * @desc    Rimuovi ruoli da un utente
 * @route   POST /api/roles/users/remove
 * @access  Private/Admin
 */
export const removeRolesFromUser = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { userId, roleIds } = req.validatedBody;

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
      throw new BadRequestError(
        "Impossibile rimuovere tutti i ruoli. Almeno un ruolo è richiesto.",
      );
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

    res.json({
      status: "success",
      message: "Ruoli rimossi con successo",
      data: updatedUser,
    });
  },
);

/**
 * @desc    Lista ruoli di un utente
 * @route   GET /api/roles/users/:userId/roles
 * @access  Private/Admin
 */
export const getUserRoles = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { userId } = req.validatedParams;

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

    res.json({
      status: "success",
      results: user.roles.length,
      data: user,
    });
  },
);

/**
 * @desc    Lista tutti i permessi di un utente (tramite ruoli)
 * @route   GET /api/roles/users/:userId/permissions
 * @access  Private/Admin
 */
export const getUserPermissions = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { userId } = req.validatedParams;

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

    res.json({
      status: "success",
      results: permissions.length,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        permissions,
      },
    });
  },
);

/**
 * @desc    Verifica se un utente ha un permesso specifico
 * @route   POST /api/roles/users/check-permission
 * @access  Private/Admin
 */
export const checkUserPermission = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { userId, permissionCode } = req.validatedBody;

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

    res.json({
      status: "success",
      data: {
        userId,
        permissionCode,
        hasPermission,
      },
    });
  },
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * @desc    Sincronizza permessi dal codice al database
 * @route   POST /api/roles/sync-permissions
 * @access  Private/Admin
 */
export const syncPermissions = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    // Lista di permessi predefiniti da sincronizzare
    const defaultPermissions = [
      // Activity permissions
      {
        code: "activity:read",
        resource: "activity",
        action: "read",
        description: "Lettura attività",
      },
      {
        code: "activity:create",
        resource: "activity",
        action: "create",
        description: "Creazione attività",
      },
      {
        code: "activity:update",
        resource: "activity",
        action: "update",
        description: "Modifica attività",
      },
      {
        code: "activity:delete",
        resource: "activity",
        action: "delete",
        description: "Eliminazione attività",
      },
      {
        code: "activity:manage",
        resource: "activity",
        action: "manage",
        description: "Gestione completa attività",
      },

      // Activity permissions
      {
        code: "address:read",
        resource: "address",
        action: "read",
        description: "Lettura indirizzi",
      },
      {
        code: "address:create",
        resource: "address",
        action: "create",
        description: "Creazione indirizzi",
      },
      {
        code: "address:update",
        resource: "address",
        action: "update",
        description: "Modifica indirizzi",
      },
      {
        code: "address:delete",
        resource: "address",
        action: "delete",
        description: "Eliminazione indirizzi",
      },
      {
        code: "address:manage",
        resource: "address",
        action: "manage",
        description: "Gestione completa indirizzi",
      },

      // User permissions
      { code: "user:read", resource: "user", action: "read", description: "Lettura utenti" },
      { code: "user:create", resource: "user", action: "create", description: "Creazione utenti" },
      { code: "user:update", resource: "user", action: "update", description: "Modifica utenti" },
      {
        code: "user:delete",
        resource: "user",
        action: "delete",
        description: "Eliminazione utenti",
      },
      {
        code: "user:manage",
        resource: "user",
        action: "manage",
        description: "Gestione completa utenti",
      },

      // Role permissions
      { code: "role:read", resource: "role", action: "read", description: "Lettura ruoli" },
      { code: "role:create", resource: "role", action: "create", description: "Creazione ruoli" },
      { code: "role:update", resource: "role", action: "update", description: "Modifica ruoli" },
      {
        code: "role:delete",
        resource: "role",
        action: "delete",
        description: "Eliminazione ruoli",
      },
      {
        code: "role:manage",
        resource: "role",
        action: "manage",
        description: "Gestione completa ruoli",
      },

      // Permission permissions
      {
        code: "permission:read",
        resource: "permission",
        action: "read",
        description: "Lettura permessi",
      },
      {
        code: "permission:create",
        resource: "permission",
        action: "create",
        description: "Creazione permessi",
      },
      {
        code: "permission:update",
        resource: "permission",
        action: "update",
        description: "Modifica permessi",
      },
      {
        code: "permission:delete",
        resource: "permission",
        action: "delete",
        description: "Eliminazione permessi",
      },
      {
        code: "permission:manage",
        resource: "permission",
        action: "manage",
        description: "Gestione completa permessi",
      },

      // Product permissions
      {
        code: "product:read",
        resource: "product",
        action: "read",
        description: "Lettura prodotti",
      },
      {
        code: "product:create",
        resource: "product",
        action: "create",
        description: "Creazione prodotti",
      },
      {
        code: "product:update",
        resource: "product",
        action: "update",
        description: "Modifica prodotti",
      },
      {
        code: "product:delete",
        resource: "product",
        action: "delete",
        description: "Eliminazione prodotti",
      },
      {
        code: "product:manage",
        resource: "product",
        action: "manage",
        description: "Gestione completa prodotti",
      },

      // Document permissions
      {
        code: "document:read",
        resource: "document",
        action: "read",
        description: "Lettura documenti",
      },
      {
        code: "document:create",
        resource: "document",
        action: "create",
        description: "Creazione documenti",
      },
      {
        code: "document:update",
        resource: "document",
        action: "update",
        description: "Modifica documenti",
      },
      {
        code: "document:delete",
        resource: "document",
        action: "delete",
        description: "Eliminazione documenti",
      },
      {
        code: "document:approve",
        resource: "document",
        action: "approve",
        description: "Approvazione documenti",
      },
      {
        code: "document:manage",
        resource: "document",
        action: "manage",
        description: "Gestione completa documenti",
      },

      // Company permissions
      { code: "company:read", resource: "company", action: "read", description: "Lettura aziende" },
      {
        code: "company:create",
        resource: "company",
        action: "create",
        description: "Creazione aziende",
      },
      {
        code: "company:update",
        resource: "company",
        action: "update",
        description: "Modifica aziende",
      },
      {
        code: "company:delete",
        resource: "company",
        action: "delete",
        description: "Eliminazione aziende",
      },
      {
        code: "company:manage",
        resource: "company",
        action: "manage",
        description: "Gestione completa aziende",
      },

      // Customer permissions
      {
        code: "customer:read",
        resource: "customer",
        action: "read",
        description: "Lettura clienti",
      },
      {
        code: "customer:create",
        resource: "customer",
        action: "create",
        description: "Creazione clienti",
      },
      {
        code: "customer:update",
        resource: "customer",
        action: "update",
        description: "Modifica clienti",
      },
      {
        code: "customer:delete",
        resource: "customer",
        action: "delete",
        description: "Eliminazione clienti",
      },
      {
        code: "customer:manage",
        resource: "customer",
        action: "manage",
        description: "Gestione completa clienti",
      },

      // Supplier permissions
      {
        code: "supplier:read",
        resource: "supplier",
        action: "read",
        description: "Lettura fornitori",
      },
      {
        code: "supplier:create",
        resource: "supplier",
        action: "create",
        description: "Creazione fornitori",
      },
      {
        code: "supplier:update",
        resource: "supplier",
        action: "update",
        description: "Modifica fornitori",
      },
      {
        code: "supplier:delete",
        resource: "supplier",
        action: "delete",
        description: "Eliminazione fornitori",
      },
      {
        code: "supplier:manage",
        resource: "supplier",
        action: "manage",
        description: "Gestione completa fornitori",
      },

      // Contact permissions
      {
        code: "contact:read",
        resource: "contact",
        action: "read",
        description: "Lettura contatti",
      },
      {
        code: "contact:create",
        resource: "contact",
        action: "create",
        description: "Creazione contatti",
      },
      {
        code: "contact:update",
        resource: "contact",
        action: "update",
        description: "Modifica contatti",
      },
      {
        code: "contact:delete",
        resource: "contact",
        action: "delete",
        description: "Eliminazione contatti",
      },
      {
        code: "contact:manage",
        resource: "contact",
        action: "manage",
        description: "Gestione completa contatti",
      },

      // Opportunity permissions
      {
        code: "opportunity:read",
        resource: "opportunity",
        action: "read",
        description: "Lettura opportunità",
      },
      {
        code: "opportunity:create",
        resource: "opportunity",
        action: "create",
        description: "Creazione opportunità",
      },
      {
        code: "opportunity:update",
        resource: "opportunity",
        action: "update",
        description: "Modifica opportunità",
      },
      {
        code: "opportunity:delete",
        resource: "opportunity",
        action: "delete",
        description: "Eliminazione opportunità",
      },
      {
        code: "opportunity:manage",
        resource: "opportunity",
        action: "manage",
        description: "Gestione completa opportunità",
      },

      // Warehouse permissions
      {
        code: "warehouse:read",
        resource: "warehouse",
        action: "read",
        description: "Lettura magazzino",
      },
      {
        code: "warehouse:update",
        resource: "warehouse",
        action: "update",
        description: "Modifica magazzino",
      },
      {
        code: "warehouse:manage",
        resource: "warehouse",
        action: "manage",
        description: "Gestione completa magazzino",
      },

      // Tax permissions
      { code: "tax:read", resource: "tax", action: "read", description: "Lettura tasse" },
      { code: "tax:create", resource: "tax", action: "create", description: "Creazione tasse" },
      { code: "tax:update", resource: "tax", action: "update", description: "Modifica tasse" },
      { code: "tax:delete", resource: "tax", action: "delete", description: "Eliminazione tasse" },
      {
        code: "tax:manage",
        resource: "tax",
        action: "manage",
        description: "Gestione completa tasse",
      },

      // Payment permissions
      {
        code: "payment:read",
        resource: "payment",
        action: "read",
        description: "Lettura metodi pagamento",
      },
      {
        code: "payment:create",
        resource: "payment",
        action: "create",
        description: "Creazione metodi pagamento",
      },
      {
        code: "payment:update",
        resource: "payment",
        action: "update",
        description: "Modifica metodi pagamento",
      },
      {
        code: "payment:delete",
        resource: "payment",
        action: "delete",
        description: "Eliminazione metodi pagamento",
      },
      {
        code: "payment:manage",
        resource: "payment",
        action: "manage",
        description: "Gestione completa metodi pagamento",
      },

      // PriceList permissions
      {
        code: "pricelist:read",
        resource: "pricelist",
        action: "read",
        description: "Lettura listini prezzi",
      },
      {
        code: "pricelist:create",
        resource: "pricelist",
        action: "create",
        description: "Creazione listini prezzi",
      },
      {
        code: "pricelist:update",
        resource: "pricelist",
        action: "update",
        description: "Modifica listini prezzi",
      },
      {
        code: "pricelist:delete",
        resource: "pricelist",
        action: "delete",
        description: "Eliminazione listini prezzi",
      },
      {
        code: "pricelist:manage",
        resource: "pricelist",
        action: "manage",
        description: "Gestione completa listini prezzi",
      },

      // Category permissions
      {
        code: "category:read",
        resource: "category",
        action: "read",
        description: "Lettura categorie",
      },
      {
        code: "category:create",
        resource: "category",
        action: "create",
        description: "Creazione categorie",
      },
      {
        code: "category:update",
        resource: "category",
        action: "update",
        description: "Modifica categorie",
      },
      {
        code: "category:delete",
        resource: "category",
        action: "delete",
        description: "Eliminazione categorie",
      },
      {
        code: "category:manage",
        resource: "category",
        action: "manage",
        description: "Gestione completa categorie",
      },

      // Dashboard permissions
      {
        code: "dashboard:read",
        resource: "dashboard",
        action: "read",
        description: "Visualizzazione dashboard",
      },
      {
        code: "dashboard:manage",
        resource: "dashboard",
        action: "manage",
        description: "Gestione completa dashboard",
      },

      // Report permissions
      {
        code: "report:read",
        resource: "report",
        action: "read",
        description: "Visualizzazione report",
      },
      {
        code: "report:export",
        resource: "report",
        action: "export",
        description: "Esportazione report",
      },
      {
        code: "report:manage",
        resource: "report",
        action: "manage",
        description: "Gestione completa report",
      },
    ];

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
    const permissionsToAssign = allPermissionIds.filter(
      (id) => !existingPermissionIds.includes(id),
    );

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

    res.json({
      status: "success",
      message: "Sincronizzazione completata",
      data: {
        permissions: results,
        adminRole: {
          id: adminRole.id,
          code: adminRole.code,
          name: adminRole.name,
          totalPermissions: allPermissionIds.length,
          newlyAssigned: results.adminAssigned,
        },
      },
    });
  },
);
