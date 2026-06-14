// controllers/user.ts
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../utils/app-error-utils";
import { prisma } from "../config/prisma-config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserPayload } from "../types/user-types";

import {
  clearTokenCookies,
  generateResetToken,
  generateTokenPair,
  getUserSelection,
  setTokenCookies,
  extractFingerprint,
  saveSession,
  destroySession,
  isRefreshTokenValid,
  rotateRefreshToken,
  invalidateUserPermissionsCache,
  destroyAllUserSessions,
  calculateLockUntil,
  mapUserResponse,
} from "../helpers/user-helper";

import authConfig from "../config/auth-config";
import { sendDeleted, sendPaginatedResponse, sendSuccess } from "../utils/response-utils";
import {
  ChangePasswordInput,
  CreateUserInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterUserInput,
  ResetPasswordInput,
  ToggleUserStatusInput,
  UpdateUserDetailsInput,
  UpdateUserProfileInput,
  UpdateUserRolesInput,
  UserIdParam,
  UserQueryInput,
  VerifyEmailInput,
} from "@mini-erp/shared/types";
import { redisClient } from "@/config/redis-config";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { getCookie } from "hono/cookie";
import logger from "@/config/logger-config";
import {
  getPermissionsFromMembership,
  getRolesFromMembership,
  pickCurrentMembership,
} from "@/helpers/user-membership-helper";
import { Prisma } from "@/generated/prisma/client";

// ============================================================================
// PUBLIC ROUTES - Authentication
// ============================================================================

/**
 * @desc    Registra un nuovo utente
 * @route   POST /api/users/register
 * @access  Public
 */
export const register = async (c: Context<AppBindings>) => {
  const { username, email, password, details } = getValidatedBody<RegisterUserInput>(c);

  // Verifica esistenza username/email
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

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Crea utente con dettagli e ruolo
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      details: {
        create: {
          firstName: details.firstName || "",
          lastName: details.lastName || "",
        },
      },
    },
    select: getUserSelection(),
  });

  // TODO: Invia email di verifica

  return sendSuccess(
    c,
    {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      memberships: newUser.memberships,
      details: newUser.details,
    },
    {
      message: "Utente registrato con successo",
    },
  );
};

/**
 * @desc    Login utente con Redis session + fingerprinting
 * @route   POST /api/users/login
 * @access  Public
 */
export const login = async (c: Context<AppBindings>) => {
  const { email, password } = getValidatedBody<LoginInput>(c);

  // Trova utente con ruoli e dettagli
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      active: true,
      lockedUntil: true,
      failedLoginAttempts: true,
      preferredLanguageId: true,
      details: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      memberships: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          tenantId: true,
          status: true,
          isDefault: true,
          tenant: {
            select: {
              code: true,
              company: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  permissions: {
                    select: {
                      permission: {
                        select: {
                          code: true,
                        },
                      },
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

  if (!user) {
    throw new UnauthorizedError("Credenziali non valide");
  }

  // Verifica account non bloccato
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new UnauthorizedError(
      `Account temporaneamente bloccato. Riprova tra ${minutesLeft} minuti.`,
    );
  }

  // Verifica se l'utente è attivo
  if (!user.active) {
    throw new UnauthorizedError("Account disabilitato");
  }

  if (!user.memberships.length) {
    throw new UnauthorizedError("Nessun tenant attivo associato all'utente");
  }

  // Verifica password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Incrementa tentativi falliti
    const newFailedAttempts = user.failedLoginAttempts + 1;
    const updateData: any = {
      failedLoginAttempts: newFailedAttempts,
      lastFailedLoginAt: new Date(),
    };

    // Blocca dopo 5 tentativi
    if (newFailedAttempts >= 5) {
      updateData.lockedUntil = calculateLockUntil(newFailedAttempts);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    throw new UnauthorizedError("Credenziali non valide");
  }

  // Login riuscito: reset tentativi falliti ed aggiorna lastLogin
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    },
  });

  const currentMembership = pickCurrentMembership(user.memberships);

  if (!currentMembership) {
    throw new UnauthorizedError("Nessun tenant attivo disponibile");
  }

  // 1. Genera fingerprint dal browser o da Next.js header
  const fingerprint = extractFingerprint(c);

  // 2. Genera token con jti
  const userPayload: UserPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    preferredLanguageId: user.preferredLanguageId,
    firstName: user.details?.firstName || "",
    lastName: user.details?.lastName || "",

    currentTenant: {
      tenantId: currentMembership.tenantId,
      membershipId: currentMembership.id,
      status: currentMembership.status,
      roles: getRolesFromMembership(currentMembership),
      permissions: getPermissionsFromMembership(currentMembership),
    },

    availableTenants: user.memberships.map((membership) => ({
      tenantId: membership.tenantId,
      name: membership.tenant.company.companyName,
      code: membership.tenant.code,
      isDefault: membership.isDefault,
      status: membership.status,
    })),
  };

  const tokens = generateTokenPair(userPayload, fingerprint);

  // 3. Salva sessione + refresh token in Redis (atomico)
  await saveSession(
    user.id,
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      currentTenant: {
        tenantId: currentMembership.tenantId,
        membershipId: currentMembership.id,
        status: currentMembership.status,
        roles: getRolesFromMembership(currentMembership),
        permissions: getPermissionsFromMembership(currentMembership),
      },
      fingerprint,
      loginAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      metadata: {
        ip: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    },
    tokens.refreshTokenId!,
  );

  // 4. Imposta cookie HttpOnly sicuri
  setTokenCookies(c, tokens);

  return sendSuccess(
    c,
    {
      user: userPayload,
      // Opzionale: ritorna exp per frontend
      expiresIn: authConfig.jwt.expiresInMs,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    {
      message: "Login effettuato con successo",
    },
  );
};

/**
 * @desc    Logout utente con Redis transaction
 * @route   POST /api/users/logout
 * @access  Private (require authenticateToken)
 */
export const logout = async (c: Context<AppBindings>) => {
  const user = c.get("user");

  if (!user) throw new BadRequestError("Token mancante");

  const { userId, jti, exp } = user;

  if (!jti) {
    throw new BadRequestError("JTI mancante nel token");
  }

  // Calcola TTL per blacklist (tempo rimanente alla scadenza del token)
  const now = Math.floor(Date.now() / 1000);
  const ttl = Math.max((exp || 0) - now, 60); // Minimo 60s

  // Distruggi sessione Redis (atomico: MULTI/EXEC)
  await destroySession(userId, jti, ttl);

  // Rimuovi cookie
  clearTokenCookies(c);

  return sendSuccess(
    c,
    {},
    {
      message: "Logout effettuato con successo",
    },
  );
};

/**
 * @desc    Refresh access token con token rotation
 * @route   POST /api/users/refresh-token
 * @access  Public (cookie-based)
 */
export const refreshToken = async (c: Context<AppBindings>) => {
  // Il token viene letto dal cookie, non dal body

  const token = getCookie(c, "refreshToken");

  if (!token) {
    throw new UnauthorizedError("Refresh token mancante");
  }

  let decoded: any;
  // 1. Verifica refresh token
  try {
    decoded = jwt.verify(token, authConfig.jwt.refreshSecret) as any;
  } catch (error) {
    throw new UnauthorizedError("Refresh token non valido o scaduto");
  }

  // Verifica fingerprint
  const tokenFingerprint = decoded.fingerprint;
  // Estrai fingerprint dalla richiesta corrente
  const currentFingerprint = extractFingerprint(c);
  // Valida fingerprint match
  if (tokenFingerprint && currentFingerprint && tokenFingerprint !== currentFingerprint) {
    console.warn(`🚨 Fingerprint mismatch detected:`, {
      userId: decoded.userId,
      tokenFingerprint,
      currentFingerprint,
    });

    // Invalida sessione per sicurezza
    // Distruggi sessione Redis (atomico: MULTI/EXEC)
    await destroySession(decoded.userId, decoded.jti, decoded.ttl);

    // Rimuovi cookie
    clearTokenCookies(c);

    throw new UnauthorizedError(
      "Fingerprint mismatch - dispositivo non riconosciuto. Effettua nuovamente il login.",
    );
  }

  // Valida claims
  if (decoded.iss !== authConfig.jwt.issuer || decoded.aud !== authConfig.jwt.audience) {
    throw new UnauthorizedError("Claims non validi");
  }

  // 2. Verifica che sia nella whitelist Redis
  const isValid = await isRefreshTokenValid(decoded.userId, decoded.jti);

  if (!isValid) {
    throw new UnauthorizedError("Refresh token non valido o già utilizzato");
  }

  // 3. Trova utente
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: getUserSelection(),
  });

  if (!user || !user.active) {
    throw new UnauthorizedError("Utente non valido o disabilitato");
  }

  const currentMembership = pickCurrentMembership(user.memberships);

  if (!currentMembership) {
    throw new UnauthorizedError("Nessun tenant attivo disponibile");
  }

  const userPayload: UserPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    preferredLanguageId: user.preferredLanguageId,
    firstName: user.details?.firstName || "",
    lastName: user.details?.lastName || "",
    currentTenant: {
      tenantId: currentMembership.tenantId,
      membershipId: currentMembership.id,
      status: currentMembership.status,
      roles: getRolesFromMembership(currentMembership),
      permissions: getPermissionsFromMembership(currentMembership),
    },
    availableTenants: user.memberships.map((membership) => ({
      tenantId: membership.tenantId,
      name: membership.tenant.company.companyName,
      code: membership.tenant.code,
      isDefault: membership.isDefault,
      status: membership.status,
    })),
  };

  const newTokens = generateTokenPair(userPayload, tokenFingerprint || currentFingerprint);

  // 6. RUOTA refresh token in Redis (atomico)
  await rotateRefreshToken(
    user.id,
    decoded.jti, // vecchio
    newTokens.refreshTokenId!, // nuovo
  );

  // 7. Aggiorna sessione
  await saveSession(
    user.id,
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      currentTenant: {
        tenantId: currentMembership.tenantId,
        membershipId: currentMembership.id,
        status: currentMembership.status,
        roles: getRolesFromMembership(currentMembership),
        permissions: getPermissionsFromMembership(currentMembership),
      },
      fingerprint: tokenFingerprint || currentFingerprint,
      loginAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      metadata: {
        ip: c.req.header("x-forwarded-for"),
        userAgent: c.req.header("user-agent"),
      },
    },
    newTokens.refreshTokenId!,
  );

  // 8. Imposta nuovi cookie
  setTokenCookies(c, newTokens);

  return sendSuccess(
    c,
    {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        details: user.details,
        currentTenant: {
          tenantId: currentMembership.tenantId,
          membershipId: currentMembership.id,
          status: currentMembership.status,
          roles: getRolesFromMembership(currentMembership),
          permissions: getPermissionsFromMembership(currentMembership),
        },
      },
      expiresIn: authConfig.jwt.expiresInMs,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    },
    {
      message: "Token aggiornato con successo",
    },
  );
};

/**
 * @desc    Richiedi reset password
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
export const forgotPassword = async (c: Context<AppBindings>) => {
  const { email } = getValidatedBody<ForgotPasswordInput>(c);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Non rivelare se l'email esiste per sicurezza
  if (!user) {
    return sendSuccess(
      c,
      {},
      {
        message: "Se l'email esiste, riceverai le istruzioni per il reset",
      },
    );
  }

  if (
    user.passwordResetAttempts >= 3 &&
    user.lastPasswordResetAt &&
    user.lastPasswordResetAt > new Date(Date.now() - 60 * 60 * 1000)
  ) {
    throw new BadRequestError("Troppi tentativi di reset. Riprova tra 1 ora.");
  }

  // Genera token di reset
  const { token, hashedToken, expiresAt } = generateResetToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
      passwordResetAttempts: {
        increment: 1,
      },
      lastPasswordResetAt: new Date(),
    },
  });

  // TODO: Invia email con il token
  // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  // await sendResetPasswordEmail(user.email, resetUrl);

  logger.info(`🔑 Reset token for ${user.email}: ${token}`); // Solo per dev!

  return sendSuccess(
    c,
    {},
    {
      message: "Se l'email esiste, riceverai le istruzioni per il reset",
    },
  );
};

/**
 * @desc    Reset password con token
 * @route   POST /api/users/reset-password
 * @access  Public
 */
export const resetPassword = async (c: Context<AppBindings>) => {
  const { token, newPassword } = getValidatedBody<ResetPasswordInput>(c);

  // Hash del token ricevuto
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Trova utente con token valido
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new BadRequestError("Token non valido o scaduto");
  }

  // Hash nuova password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Aggiorna password e rimuovi token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      passwordResetAttempts: 0, // Reset counter
      lastPasswordChangeAt: new Date(),
      // Forza logout invalidando tutte le sessioni
    },
  });

  await destroyAllUserSessions(user.id);

  return sendSuccess(
    c,
    {},
    {
      message: "Password reimpostata con successo",
    },
  );
};

/**
 * @desc    Verifica email
 * @route   GET /api/users/verify-email/:token
 * @access  Public
 */
export const verifyEmail = async (c: Context<AppBindings>) => {
  const { token } = getValidatedParams<VerifyEmailInput>(c);

  // Hash del token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Trova utente con token valido
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new BadRequestError("Token di verifica non valido o scaduto");
  }

  // Marca email come verificata
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      emailVerifiedAt: new Date(),
    },
  });

  return sendSuccess(
    c,
    {},
    {
      message: "Email verificata con successo",
    },
  );
};

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
  const tenantId = c.get("currentTenantId");

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
 * @desc    Aggiorna ruoli di un utente
 * @route   PUT /api/users/:id/roles
 * @access  Private/Admin
 */
export const updateRole = async (c: Context<AppBindings>) => {
  const { id: userId } = getValidatedParams<UserIdParam>(c);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  if (userId === c.get("user")!.userId) {
    throw new BadRequestError("Non puoi modificare i tuoi ruoli");
  }

  throw new BadRequestError(
    "I ruoli devono essere aggiornati a livello di membership tenant. Usa un endpoint dedicato con membershipId o tenantId.",
  );
};

/**
 * @desc    Attiva/Disattiva un utente
 * @route   PATCH /api/users/:id/toggle-active
 * @access  Private/Admin
 */
export const toggleUserActive = async (c: Context<AppBindings>) => {
  const { id: userId } = getValidatedParams<UserIdParam>(c);
  const { active } = getValidatedBody<ToggleUserStatusInput>(c);

  // Verifica esistenza utente
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
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
 * @desc    Elimina un utente
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (c: Context<AppBindings>) => {
  const { id: userId } = getValidatedParams<UserIdParam>(c);

  // Verifica esistenza utente
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  // Non permettere di eliminare se stessi
  if (userId === c.get("user")!.userId) {
    throw new BadRequestError("Non puoi eliminare il tuo account");
  }

  // Elimina utente (cascade gestirà le relazioni)
  await prisma.user.delete({
    where: { id: userId },
  });

  return sendDeleted(c, "Utente eliminato con successo");
};
