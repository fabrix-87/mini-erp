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
  invalidateUserPermissionsCache,
  getUserDetailedSelection,
} from "../helpers/user-helper";

import { sendDeleted, sendPaginatedResponse, sendSuccess } from "../utils/response-utils";
import {
  ChangePasswordInput,
  CreateUserInput,
  ToggleUserStatusInput,
  UpdateUserDetailsInput,
  UpdateUserFormInput,
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
import { connectById, connectOrDisconnectByCode } from "@/helpers/prisma-helper";

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
    select: getUserDetailedSelection(),
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
    deletedAt: null,
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
    where: { id, deletedAt: null },
    select: getUserDetailedSelection(),
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  return sendSuccess(c, mapUserResponse(user));
};

/**
 * Creates a new user with personal details and role assignments within the current tenant.
 * Checks for username/email conflicts globally, then creates the user, their details,
 * a tenant membership, and assigns the specified roles — all within a single atomic transaction.
 *
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = async (c: Context<AppBindings>) => {
  const {
    username,
    email,
    password,
    active = true,
    preferredLanguageId,
    roleIds = [],
    details,
  } = getValidatedBody<CreateUserInput>(c);
  const tenantId = c.get("currentTenantId")!;

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

  const newUser = await prisma.$transaction(async (tx) => {
    // 1. Crea l'utente con i dettagli
    const user = await tx.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        active,
        preferredLanguageId,
        details: details
          ? {
              create: {
                firstName: details.firstName,
                lastName: details.lastName,
                gender: details.gender ?? "PREFER_NOT_TO_SAY",
                phone: details.phone,
                dateOfBirth: details.dateOfBirth ? new Date(details.dateOfBirth) : undefined,
                bio: details.bio,
                address: details.address,
                city: details.city,
                countryCode: details.countryCode,
                state: details.state,
                zipCode: details.zipCode,
              },
            }
          : undefined,
      },
      select: { id: true },
    });

    // 2. Crea la membership nel tenant corrente
    const membership = await tx.userTenantMembership.create({
      data: {
        userId: user.id,
        tenantId,
        status: "ACTIVE",
        isDefault: true,
      },
      select: { id: true },
    });

    // 3. Assegna i ruoli (se presenti)
    if (roleIds.length > 0) {
      await tx.userTenantMembershipRole.createMany({
        data: roleIds.map((roleId) => ({
          membershipId: membership.id,
          roleId,
        })),
      });
    }

    return user.id;
  });

  // Ricarica l'utente completo con la selezione standard
  const createdUser = await prisma.user.findUnique({
    where: { id: newUser },
    select: getUserSelection(),
  });

  if (!createdUser) throw new NotFoundError("Utente non trovato dopo la creazione");

  return sendSuccess(c, mapUserResponse(createdUser), {
    message: "Utente creato con successo",
  });
};

/**
 * Updates a user's profile, personal details, and role assignments in a single atomic transaction.
 * Only fields present in the request body are updated (partial update).
 * Invalidates the Redis profile cache after a successful update.
 *
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (c: Context<AppBindings>) => {
  const { id: userId } = getValidatedParams<UserIdParam>(c);
  const tenantId = c.get("currentTenantId")!;

  const {
    username,
    email,
    preferredLanguageId,
    roleIds,
    firstName,
    lastName,
    phone,
    address,
    city,
    state,
    zipCode,
    countryCode,
    dateOfBirth,
    gender,
    bio,
  } = getValidatedBody<UpdateUserFormInput>(c);

  console.log(`countryCode: ${countryCode}`);

  // Verifica appartenenza al tenant
  const isMember = await checkUserTenantMembership({ userId, tenantId });
  if (!isMember) throw new NotFoundError("Utente non trovato");

  // Unicità username (escludi utente corrente)
  if (username !== undefined) {
    const conflict = await prisma.user.findFirst({
      where: { username, id: { not: userId } },
    });
    if (conflict) throw new ConflictError("Username già in uso");
  }

  // Unicità email (escludi utente corrente)
  if (email !== undefined) {
    const conflict = await prisma.user.findFirst({
      where: { email, id: { not: userId } },
    });
    if (conflict) throw new ConflictError("Email già in uso");
  }

  // Campi tabella User
  const profileData: Prisma.UserUpdateInput = {};
  if (username !== undefined) profileData.username = username;
  if (email !== undefined) profileData.email = email;
  if (preferredLanguageId !== undefined)
    profileData.preferredLanguage = connectById(preferredLanguageId);

  // Campi tabella UserDetails
  const detailsData: Prisma.UserDetailsUpdateInput = {};
  if (firstName !== undefined) detailsData.firstName = firstName;
  if (lastName !== undefined) detailsData.lastName = lastName;
  if (phone !== undefined) detailsData.phone = phone;
  if (address !== undefined) detailsData.address = address;
  if (city !== undefined) detailsData.city = city;
  if (state !== undefined) detailsData.state = state;
  if (zipCode !== undefined) detailsData.zipCode = zipCode;
  if (countryCode !== undefined) detailsData.country = connectOrDisconnectByCode(countryCode);
  if (dateOfBirth !== undefined) detailsData.dateOfBirth = dateOfBirth;
  if (gender !== undefined) detailsData.gender = gender;
  if (bio !== undefined) detailsData.bio = bio;

  await prisma.$transaction(async (tx) => {
    // 1. Aggiorna profilo (se ci sono campi)
    if (Object.keys(profileData).length > 0) {
      await tx.user.update({ where: { id: userId }, data: profileData });
    }

    // 2. Upsert dettagli (se ci sono campi)
    if (Object.keys(detailsData).length > 0) {
      const detailsCreate: Prisma.UserDetailsCreateInput = {
        user: { connect: { id: userId } },
        ...(detailsData as Omit<Prisma.UserDetailsUncheckedCreateInput, "userId">),
      };

      await tx.userDetails.upsert({
        where: { userId },
        update: detailsData,
        create: detailsCreate,
      });
    }

    // 3. Aggiorna ruoli nel tenant (se forniti)
    if (roleIds !== undefined) {
      // Recupera il membershipId per questo utente+tenant
      const membership = await tx.userTenantMembership.findUnique({
        where: { userId_tenantId: { userId, tenantId } },
        select: { id: true },
      });

      if (!membership) throw new NotFoundError("Membership non trovata");

      // Sostituisce tutti i ruoli correnti con i nuovi
      await tx.userTenantMembershipRole.deleteMany({
        where: { membershipId: membership.id },
      });

      if (roleIds.length > 0) {
        await tx.userTenantMembershipRole.createMany({
          data: roleIds.map((roleId) => ({
            membershipId: membership.id,
            roleId,
          })),
        });
      }
    }
  });

  // Invalida cache profilo e permessi
  const cacheKey = `user:profile:${userId}`;
  await Promise.all([redisClient.del(cacheKey), invalidateUserPermissionsCache(userId)]);

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: getUserSelection(),
  });

  if (!updatedUser) throw new NotFoundError("Utente non trovato");

  const userData = mapUserResponse(updatedUser, tenantId);
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(userData));

  return sendSuccess(c, userData, {
    message: "Utente aggiornato con successo",
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
  const tenantId = c.get("currentTenantId")!;

  // Verifica esistenza utente ed associazione tenant
  const member = await checkUserTenantMembership({ userId, tenantId });

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

  // Immediate guard clause: Prevent self-deletion before hitting the DB
  if (userId === currentUserId) {
    throw new BadRequestError("Non puoi eliminare il tuo account");
  }

  try {
    // Single-step verification & update (Atomic operation)
    await prisma.user.update({
      where: {
        id: userId,
        deletedAt: null, // Prevents re-deleting an already deleted user
      },
      data: {
        deletedAt: new Date(),
        deletedByUser: {connect: {id: currentUserId}},
      },
    });
  } catch (error) {
    // Prisma throws P2025 when the record to update is not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new NotFoundError("Utente non trovato");
    }
    throw error; // Forward any other unexpected DB errors
  }

  return sendDeleted(c, "Utente eliminato con successo");
};
