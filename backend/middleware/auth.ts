// middleware/auth.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/app-error';
import { prisma } from '../config/prisma-client';
import { AuthRequest, UserPayload } from '../types/user'

// ============================================================================
// AUTHENTICATION MIDDLEWARE (Cookie-based)
// ============================================================================

/**
 * Middleware di autenticazione che legge il token dal cookie HttpOnly
 * 
 * @example
 * router.get('/protected', authenticateToken, controller);
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Leggi access token dal cookie
    const token = req.cookies.accessToken;

    if (!token) {
      throw new UnauthorizedError('Token di autenticazione mancante');
    }

    // Verifica e decodifica il token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as UserPayload;

    // Aggiungi user info alla request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token scaduto');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Token non valido');
    }
    throw error;
  }
};

// ============================================================================
// AUTHORIZATION MIDDLEWARE (Permission-based)
// ============================================================================

/**
 * Middleware di autorizzazione basato su permessi
 * Verifica che l'utente abbia almeno uno dei permessi richiesti
 * 
 * @param requiredPermissions - Array di permessi richiesti (es. ['user:read', 'user:manage'])
 * 
 * @example
 * router.get('/admin', authenticateToken, authorize(['admin:access']), controller);
 * router.put('/users/:id', authenticateToken, authorize(['user:update', 'user:manage']), controller);
 */
export const authorize = (requiredPermissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('Autenticazione richiesta');
      }

      // 1. Recupera i permessi effettivi dell'utente dal Database
      //    (User -> Roles -> Permissions)
      const userWithPermissions = await prisma.user.findUnique({
        where: { id: req.user.userId }, // Usa req.user.id (come definito in UserPayload)
        select: {
          roles: {
            select: {
              permissions: {
                select: {
                  permission: {
                    select: {
                      code: true, // Estraiamo solo il codice (es. 'invoice:create')
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!userWithPermissions) {
        throw new UnauthorizedError('Utente non trovato.');
      }

      // 2. Appiattisci la struttura nidificata in un Set di stringhe
      //    Struttura: User -> roles[] -> permissions[] -> permission -> code
      const userPermissionCodes = new Set<string>();

      userWithPermissions.roles.forEach((role) => {
        role.permissions.forEach((rp) => {
          if (rp.permission && rp.permission.code) {
            userPermissionCodes.add(rp.permission.code);
          }
        });
      });

      // 3. Verifica i permessi
      //    Logica .some(): Basta avere ALMENO UNO dei permessi richiesti.
      //    Se vuoi che li abbia TUTTI, usa .every()
      const hasPermission = requiredPermissions.some((reqPerm) =>
        userPermissionCodes.has(reqPerm)
      );

      if (!hasPermission) {
        throw new ForbiddenError(
          `Non hai i permessi necessari. Richiesti: [${requiredPermissions.join(', ')}]`
        );
      }

      next();
    } catch (error) {
      next(error); // Passa l'errore al gestore globale
    }
  };
};

/**
 * Middleware di autorizzazione basato su ruoli
 * Verifica che l'utente abbia almeno uno dei ruoli richiesti
 * 
 * @param requiredRoles - Array di codici ruolo richiesti (es. ['ADMIN', 'MANAGER'])
 * 
 * @example
 * router.delete('/users/:id', authenticateToken, requireRole(['ADMIN']), controller);
 */
export const requireRole = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Autenticazione richiesta');
    }

    // Estrai i codici dei ruoli dell'utente
    const userRoleCodes = req.user.roles.map((role) => role.code);

    // Verifica se l'utente ha almeno uno dei ruoli richiesti
    const hasRole = requiredRoles.some((role) =>
      userRoleCodes.includes(role)
    );

    if (!hasRole) {
      throw new ForbiddenError(
        `Questa operazione richiede uno dei seguenti ruoli: ${requiredRoles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Middleware per verificare che l'utente acceda solo alle proprie risorse
 * Confronta l'ID utente nel token con l'ID nei params
 * 
 * @param paramName - Nome del parametro da confrontare (default: 'id')
 * 
 * @example
 * // L'utente può modificare solo il proprio profilo
 * router.put('/users/:id/profile', authenticateToken, requireSelfOrAdmin(), updateProfile);
 */
export const requireSelfOrAdmin = (paramName: string = 'id') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Autenticazione richiesta');
    }

    const resourceId = parseInt(req.params[paramName], 10);
    const userId = req.user.userId;

    // Permetti se è l'utente stesso
    if (resourceId === userId) {
      return next();
    }

    // Permetti se è admin
    const isAdmin = req.user.roles.some(
      (role) => role.code === 'ADMIN' || role.code === 'user:manage'
    );

    if (isAdmin) {
      return next();
    }

    throw new ForbiddenError(
      'Puoi accedere solo alle tue risorse'
    );
  };
};

/**
 * Middleware opzionale di autenticazione
 * Se il token è presente lo valida, altrimenti continua senza errore
 * Utile per endpoint che funzionano sia per utenti autenticati che non
 * 
 * @example
 * // API che mostra più info agli utenti autenticati
 * router.get('/products', optionalAuth, getProducts);
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as UserPayload;
      req.user = decoded;
    }
  } catch (error) {
    // Ignora errori di validazione per auth opzionale
  }

  next();
};