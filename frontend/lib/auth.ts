// lib/auth.ts
// Re-export delle funzioni principali per comodità
export {
  getUserFromUserCookie,
  isAuthenticated,
  getCurrentUser,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getUserRoleCodes,
  // Funzioni avanzate per casi speciali
  decodeJWT,
} from '@/lib/jwt';
