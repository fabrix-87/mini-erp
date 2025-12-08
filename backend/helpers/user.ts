import jwt from 'jsonwebtoken';
import { TokenPair, UserPayload } from '../types/user';
import { Response } from 'express';
import crypto from 'crypto';
import authConfig from '../config/auth'

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
 * Genera coppia di token (access + refresh)
 */
export const generateTokenPair = (user: UserPayload): TokenPair => {
  const accessToken = jwt.sign(
    user, 
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.expiresIn as any }
  );

  const refreshToken = jwt.sign(
    { userId: user.userId }, 
    authConfig.jwt.refreshSecret,
    { expiresIn: authConfig.jwt.refreshExpiresIn as any }
  );

  return { accessToken, refreshToken };
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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