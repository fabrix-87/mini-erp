// middleware/auth.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/app-error';
import { AuthRequest, UserPayload } from '../types/user';
import authConfig from '../config/auth';
import {
  verifyFingerprint,
  isTokenBlacklisted,
  getSession,
  refreshSessionTTL,
  updateSessionActivity,
  hasPermission,
} from '../helpers/user';

// ============================================================================
// AUTHENTICATION MIDDLEWARE (Cookie-based with Redis validation)
// ============================================================================

/**
 * Middleware di autenticazione COMPLETO con:
 * - Verifica firma JWT
 * - Controllo blacklist (jti)
 * - Verifica sessione Redis
 * - Controllo fingerprint
 * - Claims validation (iss, aud)
 * 
 * @example
 * router.get('/protected', authenticateToken, controller);
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Leggi access token dal cookie
    const token = req.cookies.accessToken;

    if (!token) {
      throw new UnauthorizedError('Token di autenticazione mancante');
    }

    // 2. Verifica e decodifica il token (firma + exp)
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token scaduto');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Token non valido');
      }
      throw error;
    }

    // 3. Valida JWT claims standard
    if (decoded.iss !== authConfig.jwt.issuer) {
      throw new UnauthorizedError('Issuer non valido');
    }
    if (decoded.aud !== authConfig.jwt.audience) {
      throw new UnauthorizedError('Audience non valido');
    }

    // 4. Verifica che il token non sia nella blacklist (logout)
    if (decoded.jti && await isTokenBlacklisted(decoded.jti)) {
      throw new UnauthorizedError('Token revocato');
    }

    // 5. Verifica fingerprint (previene token theft)
    if (decoded.fingerprint && !verifyFingerprint(req, decoded.fingerprint)) {
      throw new UnauthorizedError('Fingerprint non valido - possibile furto token');
    }

    // 6. Verifica sessione attiva in Redis
    const session = await getSession(decoded.userId);
    if (!session) {
      throw new UnauthorizedError('Sessione non valida o scaduta');
    }

    // 7. Sliding session: aggiorna TTL se configurato
    await refreshSessionTTL(decoded.userId);

    // 8. Aggiorna lastActivity nella sessione
    await updateSessionActivity(decoded.userId);

    // 9. Aggiungi user info alla request
    req.user = decoded as UserPayload;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Versione LIGHTWEIGHT per Next.js Middleware (solo verifica firma locale)
 * Per uso in edge runtime dove Redis non è disponibile
 * 
 * ⚠️ Questa versione NON controlla:
 * - Blacklist
 * - Sessione Redis  
 * - Deve essere seguita da validazione completa nel Route Handler
 */
export const authenticateTokenLightweight = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new UnauthorizedError('Token di autenticazione mancante');
    }

    // Verifica SOLO firma + exp + claims base
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as UserPayload;

    // Valida claims base
    if (decoded.iss !== authConfig.jwt.issuer || decoded.aud !== authConfig.jwt.audience) {
      throw new UnauthorizedError('Claims non validi');
    }

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
 * Middleware di autorizzazione basato su permessi (con cache Redis)
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

      // Verifica permessi usando cache Redis (molto più veloce del DB)
      const hasRequiredPermission = await hasPermission(
        req.user.userId,
        requiredPermissions
      );

      if (!hasRequiredPermission) {
        throw new ForbiddenError(
          `Non hai i permessi necessari. Richiesti: [${requiredPermissions.join(', ')}]`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware di autorizzazione basato su ruoli
 */
export const requireRole = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Autenticazione richiesta');
    }

    const userRoleCodes = req.user.roles.map((role) => role.code);
    const hasRole = requiredRoles.some((role) => userRoleCodes.includes(role));

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
 */
export const requireSelfOrAdmin = (paramName: string = 'id') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Autenticazione richiesta');
    }

    const resourceId = parseInt(req.params[paramName] as string, 10);
    const userId = req.user.userId;

    if (resourceId === userId) {
      return next();
    }

    const isAdmin = req.user.roles.some(
      (role) => role.code === 'ADMIN' || role.code === 'user:manage'
    );

    if (isAdmin) {
      return next();
    }

    throw new ForbiddenError('Puoi accedere solo alle tue risorse');
  };
};

/**
 * Middleware opzionale di autenticazione
 */
export const optionalAuth = async (
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

      // Verifica base (senza Redis per performance)
      if (decoded.iss === authConfig.jwt.issuer && 
          decoded.aud === authConfig.jwt.audience) {
        req.user = decoded;
      }
    }
  } catch (error) {
    // Ignora errori per auth opzionale
  }

  next();
};
