// controllers/user.ts
import { Response } from "express";
import asyncHandler from "../middleware/async-handler";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../utils/app-error";
import { prisma } from "../config/prisma-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AuthRequest, UserPayload } from "../types/user";
import {
  AuthenticatedValidatedRequest,
  ValidatedRequest,
} from "../types/validate";
import {
  clearTokenCookies,
  formatUserRoles,
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
} from "../helpers/user";
import authConfig from "../config/auth";

// ============================================================================
// PUBLIC ROUTES - Authentication
// ============================================================================

/**
 * @desc    Registra un nuovo utente
 * @route   POST /api/users/register
 * @access  Public
 */
export const register = asyncHandler(
  async (req: ValidatedRequest, res: Response) => {
    const { username, email, password, details } = req.validatedBody!;

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

    // Trova ruolo default
    const defaultRole = await prisma.role.findFirst({
      where: { isDefault: true },
    });

    if (!defaultRole) {
      throw new BadRequestError("Nessun ruolo di default configurato");
    }

    // Crea utente con dettagli e ruolo
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        roles: {
          connect: { id: defaultRole.id },
        },
        details: {
          create: {
            firstName: details.firstName,
            lastName: details.lastName,
          },
        },
      },
      select: getUserSelection(),
    });

    // TODO: Invia email di verifica

    const formattedRoles = formatUserRoles(newUser.roles);

    res.status(201).json({
      status: "success",
      message: "Utente registrato con successo",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roles: formattedRoles,
        details: newUser.details,
      },
    });
  }
);

/**
 * @desc    Login utente con Redis session + fingerprinting
 * @route   POST /api/users/login
 * @access  Public
 */
export const login = asyncHandler(
  async (req: ValidatedRequest, res: Response) => {
    const { email, password } = req.validatedBody!;

    // Trova utente con ruoli e dettagli
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        details: true,
        roles: {
          select: {
            id: true,
            code: true,
            name: true,
            permissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    code: true,
                    description: true,
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

    // Verifica se l'utente è attivo
    if (!user.active) {
      throw new UnauthorizedError("Account disabilitato");
    }

    // Verifica password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Credenziali non valide");
    }

    // Aggiorna lastLogin
    if (user.details) {
      await prisma.userDetails.update({
        where: { userId: user.id },
        data: { lastLogin: new Date() },
      });
    }

    // 1. Genera fingerprint dal browser o da Next.js header
    const fingerprint = extractFingerprint(req);  

    // 2. Genera token con jti
    const userPayload: UserPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: formatUserRoles(user.roles),
    };

    const tokens = generateTokenPair(userPayload, fingerprint);

    // 3. Salva sessione + refresh token in Redis (atomico)
    await saveSession(
      user.id,
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        roles: formatUserRoles(user.roles),
        fingerprint,
        loginAt: new Date(),
        lastActivity: new Date(),
      },
      tokens.refreshTokenId!
    );

    // 4. Imposta cookie HttpOnly sicuri
    setTokenCookies(res, tokens);

    res.json({
      status: "success",
      message: "Login effettuato con successo",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: formatUserRoles(user.roles),
          details: user.details,
        },
        // Opzionale: ritorna exp per frontend
        expiresIn: authConfig.jwt.expiresInMs,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }
);

/**
 * @desc    Logout utente con Redis transaction
 * @route   POST /api/users/logout
 * @access  Private (require authenticateToken)
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const jti = (req.user as any).jti;

  if (!jti) {
    throw new BadRequestError("JTI mancante nel token");
  }

  // Calcola TTL per blacklist (tempo rimanente alla scadenza del token)
  const exp = (req.user as any).exp;
  const now = Math.floor(Date.now() / 1000);
  const ttl = Math.max(exp - now, 60); // Minimo 60s

  // Distruggi sessione Redis (atomico: MULTI/EXEC)
  await destroySession(userId, jti, ttl);

  // Rimuovi cookie
  clearTokenCookies(res);

  res.json({
    status: "success",
    message: "Logout effettuato con successo",
  });
});

/**
 * @desc    Refresh access token con token rotation
 * @route   POST /api/users/refresh-token
 * @access  Public (cookie-based)
 */
export const refreshToken = asyncHandler(
  async (req: ValidatedRequest, res: Response) => {
    // Il token viene letto dal cookie, non dal body
    const token = req.cookies.refreshToken;

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
    const currentFingerprint = extractFingerprint(req);
    // Valida fingerprint match
    if (
      tokenFingerprint &&
      currentFingerprint &&
      tokenFingerprint !== currentFingerprint
    ) {
      console.warn(`🚨 Fingerprint mismatch detected:`, {
        userId: decoded.userId,
        tokenFingerprint,
        currentFingerprint,
      });

      // Invalida sessione per sicurezza
      // Distruggi sessione Redis (atomico: MULTI/EXEC)
      await destroySession(decoded.userId, decoded.jti, decoded.ttl);

      // Rimuovi cookie
      clearTokenCookies(res);

      throw new UnauthorizedError(
        "Fingerprint mismatch - dispositivo non riconosciuto. Effettua nuovamente il login."
      );
    }

    // Valida claims
    if (
      decoded.iss !== authConfig.jwt.issuer ||
      decoded.aud !== authConfig.jwt.audience
    ) {
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
      include: {
        details: true,
        roles: {
          select: {
            id: true,
            code: true,
            name: true,
            permissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    code: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedError("Utente non valido");
    }

    // 5. Genera NUOVA coppia di token
    const userPayload: UserPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: formatUserRoles(user.roles),
    };

    const newTokens = generateTokenPair(
      userPayload,
      tokenFingerprint || currentFingerprint
    );

    // 6. RUOTA refresh token in Redis (atomico)
    await rotateRefreshToken(
      user.id,
      decoded.jti, // vecchio
      newTokens.refreshTokenId! // nuovo
    );

    // 7. Aggiorna sessione
    await saveSession(
      user.id,
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        roles: formatUserRoles(user.roles),
        fingerprint: tokenFingerprint || currentFingerprint,
        loginAt: new Date(),
        lastActivity: new Date(),
      },
      newTokens.refreshTokenId!
    );

    // 8. Imposta nuovi cookie
    setTokenCookies(res, newTokens);

    res.json({
      status: "success",
      message: "Token aggiornato con successo",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: formatUserRoles(user.roles),
          details: user.details,
        },
        expiresIn: authConfig.jwt.expiresInMs,
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
    });
  }
);

/**
 * @desc    Richiedi reset password
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: ValidatedRequest, res: Response) => {
    const { email } = req.validatedBody!;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Non rivelare se l'email esiste per sicurezza
    if (!user) {
      res.json({
        status: "success",
        message: "Se l'email esiste, riceverai le istruzioni per il reset",
      });
      return;
    }

    // Genera token di reset
    const { token, hashedToken, expiresAt } = generateResetToken();

    // TODO: Salva hashedToken e expiresAt nel database (aggiungere campi al modello User)
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     resetPasswordToken: hashedToken,
    //     resetPasswordExpires: expiresAt,
    //   },
    // });

    // TODO: Invia email con il token
    // await sendResetPasswordEmail(user.email, token);

    res.json({
      status: "success",
      message: "Se l'email esiste, riceverai le istruzioni per il reset",
    });
  }
);

/**
 * @desc    Reset password con token
 * @route   POST /api/users/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: ValidatedRequest, res: Response) => {
    const { token, newPassword } = req.validatedBody!;

    // Hash del token ricevuto
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // TODO: Trova utente con token valido
    // const user = await prisma.user.findFirst({
    //   where: {
    //     resetPasswordToken: hashedToken,
    //     resetPasswordExpires: { gt: new Date() },
    //   },
    // });

    // if (!user) {
    //   throw new BadRequestError('Token non valido o scaduto');
    // }

    // Hash nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // TODO: Aggiorna password e rimuovi token
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     password: hashedPassword,
    //     resetPasswordToken: null,
    //     resetPasswordExpires: null,
    //   },
    // });

    res.json({
      status: "success",
      message: "Password reimpostata con successo",
    });
  }
);

/**
 * @desc    Verifica email
 * @route   GET /api/users/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(
  async (req: ValidatedRequest, res: Response) => {
    const { token } = req.params;

    // TODO: Implementa logica di verifica email
    // const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    // const user = await prisma.user.findFirst({
    //   where: { emailVerificationToken: hashedToken },
    // });

    res.json({
      status: "success",
      message: "Email verificata con successo",
    });
  }
);

// ============================================================================
// PRIVATE ROUTES - Current User
// ============================================================================

/**
 * @desc    Ottieni info utente corrente
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  if (!userId) {
    throw new NotFoundError("ID utente non trovato");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: getUserSelection(),
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  res.json({
    status: "success",
    data: {
      ...user,
      roles: formatUserRoles(user.roles),
    },
  });
});

/**
 * @desc    Aggiorna profilo utente corrente
 * @route   PUT /api/users/me/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    // Usa validatedBody (dati già validati)
    const { username, email, preferredLanguageId, details } =
      req.validatedBody!;

    // Prendi userId dall'utente autenticato o dai params (admin)
    const userId = req.validatedParams?.id
      ? parseInt(req.validatedParams.id, 10)
      : req.user!.userId;

    // Prepara dati da aggiornare per User
    const userDataToUpdate: any = {};

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

    // Aggiorna User
    if (Object.keys(userDataToUpdate).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userDataToUpdate,
      });
    }

    // Aggiorna Details se forniti
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

    // Ricarica dati completi
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: getUserSelection(),
    });

    res.json({
      status: "success",
      message: "Profilo aggiornato con successo",
      data: {
        ...updatedUser,
        roles: formatUserRoles(updatedUser!.roles),
      },
    });
  }
);

/**
 * @desc    Aggiorna dettagli utente corrente
 * @route   PUT /api/users/me/details
 * @access  Private
 */
export const updateDetails = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const updateData = req.validatedBody!;

    // Prendi userId dall'utente autenticato o dai params (admin)
    const userId = req.validatedParams?.id
      ? parseInt(req.validatedParams.id, 10)
      : req.user!.userId;

    // Upsert dettagli
    await prisma.userDetails.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });

    // Ricarica dati completi
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: getUserSelection(),
    });

    res.json({
      status: "success",
      message: "Dettagli aggiornati con successo",
      data: {
        ...updatedUser,
        roles: formatUserRoles(updatedUser!.roles),
      },
    });
  }
);

/**
 * @desc    Cambia password utente corrente
 * @route   PUT /api/users/me/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.validatedBody!;
    const userId = req.user!.userId;

    // Trova utente
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    // Verifica password corrente
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
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
    clearTokenCookies(res);

    res.json({
      status: "success",
      message:
        "Password modificata con successo. Effettua nuovamente il login.",
    });
  }
);

// ============================================================================
// ADMIN ROUTES - User Management
// ============================================================================

/**
 * @desc    Lista tutti gli utenti con filtri e paginazione
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    // Query params già validati
    const {
      page = 1,
      limit = 10,
      search,
      active,
      roleId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.validatedQuery || {};

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Costruisci filtri dinamici
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (roleId) {
      where.roles = {
        some: { id: Number(roleId) },
      };
    }

    // Query con paginazione
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

    // Formatta risultati
    const usersFormatted = users.map((user) => ({
      ...user,
      roles: formatUserRoles(user.roles),
    }));

    res.json({
      status: "success",
      results: usersFormatted.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      data: usersFormatted,
    });
  }
);

/**
 * @desc    Ottieni dettagli di un utente specifico
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams!;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: getUserSelection(),
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    res.json({
      status: "success",
      data: {
        ...user,
        roles: formatUserRoles(user.roles),
      },
    });
  }
);

/**
 * @desc    Crea un nuovo utente (Admin)
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { username, email, password, roleIds, details, preferredLanguageId } =
      req.validatedBody!;

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

    // Crea utente
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        preferredLanguageId,
        roles: {
          connect: roleIds.map((id: number) => ({ id })),
        },
        details: details
          ? {
              create: details,
            }
          : undefined,
      },
      select: getUserSelection(),
    });

    res.status(201).json({
      status: "success",
      message: "Utente creato con successo",
      data: {
        ...newUser,
        roles: formatUserRoles(newUser.roles),
      },
    });
  }
);

/**
 * @desc    Aggiorna ruoli di un utente
 * @route   PUT /api/users/:id/roles
 * @access  Private/Admin
 */
export const updateRole = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams!;
    const { roleIds } = req.validatedBody!;

    const userId = Number(id);

    // Verifica esistenza utente
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    // Non permettere di modificare i propri ruoli
    if (userId === req.user!.userId) {
      throw new BadRequestError("Non puoi modificare i tuoi ruoli");
    }

    // Aggiorna ruoli
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: roleIds.map((roleId: number) => ({ id: roleId })),
        },
      },
      select: getUserSelection(),
    });

    // Invalida cache permessi dopo modifica ruoli
    await invalidateUserPermissionsCache(userId);

    res.json({
      status: "success",
      message: "Ruoli aggiornati con successo",
      data: {
        ...updatedUser,
        roles: formatUserRoles(updatedUser.roles),
      },
    });
  }
);

/**
 * @desc    Attiva/Disattiva un utente
 * @route   PATCH /api/users/:id/toggle-active
 * @access  Private/Admin
 */
export const toggleUserActive = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams!;
    const { active } = req.validatedBody!;

    const userId = Number(id);

    // Verifica esistenza utente
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    // Non permettere di disattivare se stessi
    if (userId === req.user!.userId) {
      throw new BadRequestError("Non puoi disattivare il tuo account");
    }

    // Aggiorna stato
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { active },
    });

    res.json({
      status: "success",
      message: `Utente ${
        updatedUser.active ? "attivato" : "disattivato"
      } con successo`,
      data: {
        userId,
        active: updatedUser.active,
      },
    });
  }
);

/**
 * @desc    Elimina un utente
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams!;

    const userId = Number(id);

    // Verifica esistenza utente
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    // Non permettere di eliminare se stessi
    if (userId === req.user!.userId) {
      throw new BadRequestError("Non puoi eliminare il tuo account");
    }

    // Elimina utente (cascade gestirà le relazioni)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
