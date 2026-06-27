// controllers/auth-controller.ts
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getCookie } from "hono/cookie";
import logger from "@/config/logger-config";
import {
  getPermissionsFromMembership,
  getRolesFromMembership,
  pickCurrentMembership,
} from "@/helpers/user-membership-helper";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";
import {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  UserSessionPayload,
  VerifyEmailInput,
} from "@mini-erp/shared";
import { prisma } from "@/config/prisma-config";
import { BadRequestError, UnauthorizedError } from "@/utils/app-error-utils";
import bcrypt from "bcryptjs";
import {
  calculateLockUntil,
  clearTokenCookies,
  destroyAllUserSessions,
  destroySession,
  extractFingerprint,
  generateResetToken,
  generateTokenPair,
  getUserSelection,
  isRefreshTokenValid,
  rotateRefreshToken,
  saveSession,
  setTokenCookies,
} from "@/helpers/user-helper";
import { sendSuccess } from "@/utils/response-utils";
import authConfig from "@/config/auth-config";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
          gender: true,
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
  const userPayload: UserSessionPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    preferredLanguageId: user.preferredLanguageId,
    details: {
      firstName: user.details?.firstName || "",
      lastName: user.details?.lastName || "",
      gender: user.details?.gender || "",
    },

    currentTenant: {
      tenantId: currentMembership.tenantId,
      name: currentMembership.tenant.company.companyName,
      code: currentMembership.tenant.code,
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

  const currentMembership =
    user.memberships.find((m) => m.tenantId === decoded.currentTenant?.tenantId) ??
    pickCurrentMembership(user.memberships);

  if (!currentMembership) {
    throw new UnauthorizedError("Nessun tenant attivo disponibile");
  }

  const userPayload: UserSessionPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    preferredLanguageId: user.preferredLanguageId,
    details: {
      firstName: user.details?.firstName || "",
      lastName: user.details?.lastName || "",
      gender: user.details?.gender || "",
    },

    currentTenant: {
      tenantId: currentMembership.tenantId,
      name: currentMembership.tenant.company.companyName,
      code: currentMembership.tenant.code,
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
