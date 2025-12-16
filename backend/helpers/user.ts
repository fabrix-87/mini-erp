// helpers/user.ts
import jwt from 'jsonwebtoken';
import { TokenPair, UserPayload, SessionData } from '../types/user';
import { Response, Request } from 'express';
import crypto from 'crypto';
import authConfig from '../config/auth';
import { redisClient, sessionKeys } from '../config/redis';
import { v4 as uuidv4 } from 'uuid';

/**
 * Selezione standard per query User con relazioni
 */
export const getUserSelection = () => ({
  id: true,
  username: true,
  email: true,
  active: true,
  roles: {
    select: { id: true, code: true, name: true },
  },
  details: true,
  preferredLanguageId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Genera fingerprint del browser basato su headers
 */
export const generateFingerprint = (req: Request): string => {
  if (!authConfig.fingerprint.enabled) {
    return 'fingerprint-disabled';
  }

  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.ip || req.socket.remoteAddress || '',
  ].join('|');

  return crypto
    .createHash(authConfig.fingerprint.algorithm)
    .update(components)
    .digest('hex')
    .substring(0, 32); // Primi 32 caratteri
};

/**
 * Verifica che il fingerprint nel token corrisponda a quello della richiesta
 */
export const verifyFingerprint = (req: Request, tokenFingerprint: string): boolean => {
  if (!authConfig.fingerprint.enabled) {
    return true;
  }
  
  const currentFingerprint = generateFingerprint(req);
  return currentFingerprint === tokenFingerprint;
};

/**
 * Genera coppia di token (access + refresh) con JWT claims completi
 */
export const generateTokenPair = (user: UserPayload, fingerprint: string): TokenPair => {
  const jti = uuidv4(); // JWT ID univoco
  const now = Math.floor(Date.now() / 1000);

  // Access Token: contiene tutti i dati utente + claims
  const accessToken = jwt.sign(
    {
      ...user,
      fingerprint,
      jti,
      iat: now,
      iss: authConfig.jwt.issuer,
      aud: authConfig.jwt.audience,
    }, 
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.expiresIn as any }
  );

  // Refresh Token: contiene solo userId + jti
  const refreshTokenId = uuidv4();
  const refreshToken = jwt.sign(
    { 
      userId: user.userId,
      jti: refreshTokenId,
      type: 'refresh',
      iat: now,
      iss: authConfig.jwt.issuer,
      aud: authConfig.jwt.audience,
    }, 
    authConfig.jwt.refreshSecret,
    { expiresIn: authConfig.jwt.refreshExpiresIn as any }
  );

  return { accessToken, refreshToken, jti, refreshTokenId };
};

/**
 * Salva sessione in Redis (atomico)
 */
export const saveSession = async (
  userId: number,
  sessionData: SessionData,
  refreshTokenId: string
): Promise<void> => {
  const multi = redisClient.multi();

  // 1. Salva dati sessione
  multi.set(
    sessionKeys.session(userId),
    JSON.stringify(sessionData),
    { EX: authConfig.session.ttl }
  );

  // 2. Salva refresh token nella whitelist
  if (authConfig.security.singleRefreshToken) {
    // Sostituisci il vecchio token
    multi.set(
      sessionKeys.refreshToken(userId),
      refreshTokenId,
      { EX: authConfig.session.ttl }
    );
  } else {
    // Aggiungi alla lista (max N token contemporanei)
    multi.lPush(sessionKeys.refreshToken(userId), refreshTokenId);
    multi.lTrim(sessionKeys.refreshToken(userId), 0, authConfig.security.maxConcurrentSessions - 1);
    multi.expire(sessionKeys.refreshToken(userId), authConfig.session.ttl);
  }

  await multi.exec();
};

/**
 * Recupera sessione da Redis
 */
export const getSession = async (userId: number): Promise<SessionData | null> => {
  try {
    const data = await redisClient.get(sessionKeys.session(userId));
    if (!data) return null;
    return JSON.parse(data) as SessionData;
  } catch (error) {
    return null;
  }
};

/**
 * Aggiorna TTL sessione (sliding session)
 */
export const refreshSessionTTL = async (userId: number): Promise<void> => {
  if (!authConfig.session.sliding) return;

  await redisClient.expire(
    sessionKeys.session(userId),
    authConfig.session.ttl
  );
};

/**
 * Verifica se refresh token è nella whitelist
 */
export const isRefreshTokenValid = async (
  userId: number,
  refreshTokenId: string
): Promise<boolean> => {
  try {
    if (authConfig.security.singleRefreshToken) {
      const storedId = await redisClient.get(sessionKeys.refreshToken(userId));
      return storedId === refreshTokenId;
    } else {
      const tokens = await redisClient.lRange(sessionKeys.refreshToken(userId), 0, -1);
      return tokens.includes(refreshTokenId);
    }
  } catch (error) {
    return false;
  }
};

/**
 * Ruota refresh token (invalida il vecchio, genera nuovo)
 */
export const rotateRefreshToken = async (
  userId: number,
  oldRefreshTokenId: string,
  newRefreshTokenId: string
): Promise<void> => {
  const multi = redisClient.multi();

  if (authConfig.security.singleRefreshToken) {
    // Sostituisci direttamente
    multi.set(
      sessionKeys.refreshToken(userId),
      newRefreshTokenId,
      { EX: authConfig.session.ttl }
    );
  } else {
    // Rimuovi vecchio, aggiungi nuovo
    multi.lRem(sessionKeys.refreshToken(userId), 1, oldRefreshTokenId);
    multi.lPush(sessionKeys.refreshToken(userId), newRefreshTokenId);
    multi.expire(sessionKeys.refreshToken(userId), authConfig.session.ttl);
  }

  await multi.exec();
};

/**
 * Aggiungi JTI alla blacklist (per logout)
 */
export const blacklistToken = async (jti: string, expiresInSeconds: number): Promise<void> => {
  await redisClient.set(
    sessionKeys.blacklist(jti),
    'blacklisted',
    { EX: expiresInSeconds }
  );
};

/**
 * Verifica se JTI è nella blacklist
 */
export const isTokenBlacklisted = async (jti: string): Promise<boolean> => {
  const result = await redisClient.get(sessionKeys.blacklist(jti));
  return result !== null;
};

/**
 * Distruggi sessione completa (logout)
 */
export const destroySession = async (
  userId: number,
  jti: string,
  ttl: number
): Promise<void> => {
  const multi = redisClient.multi();

  // 1. Rimuovi sessione
  multi.del(sessionKeys.session(userId));

  // 2. Rimuovi refresh token(s)
  multi.del(sessionKeys.refreshToken(userId));

  // 3. Aggiungi access token jti alla blacklist
  multi.set(
    sessionKeys.blacklist(jti),
    'blacklisted',
    { EX: ttl }
  );

  await multi.exec();
};

/**
 * Imposta cookie sicuri per i token
 */
export const setTokenCookies = (res: Response, tokens: TokenPair) => {  
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: authConfig.isProduction ? 'strict' : 'lax',
    maxAge: authConfig.jwt.expiresInMs,
    path: '/',
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: authConfig.isProduction ? 'strict' : 'lax',
    maxAge: authConfig.jwt.refreshExpiresInMs,
    path: '/api/users/refresh-token',
  });
};

/**
 * Rimuove i cookie dei token (per logout)
 */
export const clearTokenCookies = (res: Response) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: 'strict',
    maxAge: 0,
    path: '/api/users/refresh-token',
  });
};

/**
 * Formatta i ruoli per la risposta
 */
export const formatUserRoles = (roles: Array<{ id: number; code: string; name: string }>) => {
  return roles.map((r) => ({ id: r.id, code: r.code, name: r.name }));
};

/**
 * Genera token di reset password
 */
export const generateResetToken = (): { token: string; hashedToken: string; expiresAt: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 ora

  return { token, hashedToken, expiresAt };
};