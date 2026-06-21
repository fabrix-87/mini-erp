// controllers/user-controller.ts
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../utils/app-error-utils";
import { prisma } from "../config/prisma-config";
import bcrypt from "bcryptjs";

import {
  clearTokenCookies,
  getUserSelection,
  destroyAllUserSessions,
  mapUserResponse,
  checkUserTenantMembership,
} from "../helpers/user-helper";

import { sendDeleted, sendPaginatedResponse, sendSuccess } from "../utils/response-utils";
import {
  ChangePasswordInput,
  CreateUserInput,
  ToggleUserStatusInput,
  UpdateUserDetailsInput,
  UpdateUserProfileInput,
  UserIdParam,
  UserQueryInput,
} from "@mini-erp/shared/types";
import { redisClient } from "@/config/redis-config";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";

import { Prisma } from "@/generated/prisma/client";


// ============================================================================
// PRIVATE ROUTES - Current User
// ============================================================================

/**
 * @desc    Ottieni info utente corrente (con cache Redis)
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = async (c: Context<AppBindings>) => {
  const { userId } = c.get("user")!;

  if (!userId) {
    throw new NotFoundError("ID utente non trovato");
  }

  const cacheKey = `user:profile:${userId}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    const userData = JSON.parse(cached);
    return sendSuccess(c, userData);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: getUserSelection(),
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  const userData = mapUserResponse(user);

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(userData));

  return sendSuccess(c, userData);
};

/**
 * @desc    Aggiorna profilo utente corrente
 * @route   PUT /api/users/me/profile
 * @access  Private
 */
export const updateProfile = async (c: Context<AppBindings>) => {
  const { username, email, preferredLanguageId, details } =
    getValidatedBody<UpdateUserProfileInput>(c);

  const { id: userId } = getValidatedParams<UserIdParam>(c);

  const userDataToUpdate: Record<string, unknown> = {};

  if (username !== undefined) {
    const usernameExists = await prisma.user.findFirst({
      where: { username, id: { not: userId } },
    });

    if (usernameExists) {
      throw new ConflictError("Username già in uso");
    }

    userDataToUpdate.username = username;
  }

  if (email !== undefined) {
    const emailExists = await prisma.user.findFirst({
      where: { email, id: { not: userId } },
    });

    if (emailExists) {
      throw new ConflictError("Email già in uso");
    }

    userDataToUpdate.email = email;
  }

  if (preferredLanguageId !== undefined) {
    userDataToUpdate.preferredLanguageId = preferredLanguageId;
  }

  if (Object.keys(userDataToUpdate).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: userDataToUpdate,
    });
  }

  if (details && Object.keys(details).length > 0) {
    await prisma.userDetails.upsert({
      where: { userId },
      update: details,
      create: {
        userId,
        ...details,
      },
    });
  }

  const cacheKey = `user:profile:${userId}`;
  await redisClient.del(cacheKey);

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: getUserSelection(),
  });

  if (!updatedUser) {
    throw new NotFoundError("Utente non trovato");
  }

  const userData = mapUserResponse(updatedUser);

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(userData));

  return sendSuccess(c, userData, {
    message: "Profilo aggiornato con successo",
  });
};

/**
 * @desc    Aggiorna dettagli utente corrente
 * @route   PUT /api/users/me/details
 * @access  Private
 */
export const updateDetails = async (c: Context<AppBindings>) => {
  const updateData = getValidatedBody<UpdateUserDetailsInput>(c);
  const { id: userId } = getValidatedParams<UserIdParam>(c);

  await prisma.userDetails.upsert({
    where: { userId },
    update: updateData,
    create: {
      userId,
      ...updateData,
    },
  });

  const cacheKey = `user:profile:${userId}`;
  await redisClient.del(cacheKey);

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: getUserSelection(),
  });

  if (!updatedUser) {
    throw new NotFoundError("Utente non trovato");
  }

  const userData = mapUserResponse(updatedUser);

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(userData));

  return sendSuccess(c, userData, {
    message: "Dettagli aggiornati con successo",
  });
};

/**
 * @desc    Cambia password utente corrente
 * @route   PUT /api/users/me/change-password
 * @access  Private
 */
export const changePassword = async (c: Context<AppBindings>) => {
  const { currentPassword, newPassword } = getValidatedBody<ChangePasswordInput>(c);
  const { userId } = c.get("user")!;

  // Trova utente
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  // Verifica password corrente
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Password corrente non valida");
  }

  // Hash nuova password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Aggiorna password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Invalida tutte le sessioni per forzare nuovo login
  // (security best practice: dopo cambio password, l'utente deve rifare login)
  await destroyAllUserSessions(userId);

  // Rimuovi cookie della sessione corrente
  clearTokenCookies(c);

  return sendSuccess(
    c,
    {},
    {
      message: "Password modificata con successo. Effettua nuovamente il login.",
    },
  );
};

// ============================================================================
// ADMIN ROUTES - User Management
// ============================================================================

/**
 * @desc    Lista tutti gli utenti con filtri e paginazione
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (c: Context<AppBindings>) => {
  const {
    page = 1,
    limit = 10,
    search,
    active,
    roleId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = getValidatedQuery<UserQueryInput>(c);

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const take = limitNumber;
  const tenantId = c.get("currentTenantId")!;

  const where: Prisma.UserWhereInput = {
    memberships: {
      some: {
        tenantId,
        status: "ACTIVE",
      },
    },
  };

  if (search) {
    where.OR = [
      { username: { contains: String(search), mode: "insensitive" } },
      { email: { contains: String(search), mode: "insensitive" } },
    ];
  }

  if (active !== undefined) {
    where.active = active;
  }

  if (roleId) {
    where.memberships = {
      some: {
        status: "ACTIVE",
        tenantId,
        roles: {
          some: {
            roleId: Number(roleId),
          },
        },
      },
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: getUserSelection(),
      skip,
      take,
      orderBy: { [sortBy as string]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  const usersFormatted = users.map((user) => mapUserResponse(user, tenantId));

  return sendPaginatedResponse(c, usersFormatted, total, pageNumber, limitNumber);
};

/**
 * @desc    Ottieni dettagli di un utente specifico
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<UserIdParam>(c);

  const user = await prisma.user.findUnique({
    where: { id },
    select: getUserSelection(),
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  return sendSuccess(c, mapUserResponse(user));
};

/**
 * @desc    Crea un nuovo utente (Admin)
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = async (c: Context<AppBindings>) => {
  const { username, email, password, details, preferredLanguageId } =
    getValidatedBody<CreateUserInput>(c);
  const tenantId = c.get("currentTenantId")!

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new ConflictError("Username già in uso");
    }
    throw new ConflictError("Email già in uso");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      tenantId,
      password: hashedPassword,
      preferredLanguageId,
      details: details
        ? {
            create: details,
          }
        : undefined,
    },
    select: getUserSelection(),
  });

  return sendSuccess(c, mapUserResponse(newUser), {
    message: "Utente creato con successo",
  });
};

/**
 * @desc    Attiva/Disattiva un utente
 * @route   PATCH /api/users/:id/toggle-active
 * @access  Private/Admin
 */
export const toggleUserActive = async (c: Context<AppBindings>) => {
  const { id: userId } = getValidatedParams<UserIdParam>(c);
  const { active } = getValidatedBody<ToggleUserStatusInput>(c);
  const tenantId = c.get("currentTenantId")!

  // Verifica esistenza utente ed associazione tenant
  const member = await checkUserTenantMembership({userId, tenantId})

  if (!member) {
    throw new NotFoundError("Utente non trovato");
  }

  // Non permettere di disattivare se stessi
  if (userId === c.get("user")!.userId) {
    throw new BadRequestError("Non puoi disattivare il tuo account");
  }

  // Aggiorna stato
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { active },
  });

  return sendSuccess(
    c,
    {
      userId,
      active: updatedUser.active,
    },
    {
      message: `Utente ${updatedUser.active ? "attivato" : "disattivato"} con successo`,
    },
  );
};

/**
 * @desc    Delete a user (Soft Delete)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (c: Context<AppBindings>) => {
  const { id: userId } = getValidatedParams<UserIdParam>(c);
  const currentUserId = c.get("user")!.userId;
  const tenantId = c.get("currentTenantId")!;

  // Immediate guard clause: Prevent self-deletion before hitting the DB
  if (userId === currentUserId) {
    throw new BadRequestError("Non puoi eliminare il tuo account");
  }

  try {
    // Single-step verification & update (Atomic operation)
    await prisma.user.update({
      where: {
        id: userId,
        tenantId: tenantId, // Ensures the user belongs to the current tenant
        deletedAt: null,    // Prevents re-deleting an already deleted user
      },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUserId,
      },
    });
  } catch (error) {
    // Prisma throws P2025 when the record to update is not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError("Utente non trovato");
    }
    throw error; // Forward any other unexpected DB errors
  }

  return sendDeleted(c, "Utente eliminato con successo");
};
