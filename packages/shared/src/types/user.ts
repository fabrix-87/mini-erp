// packages/shared/src/types/user.ts
import { z } from "zod";
import type { Role, Permission } from "./role";
import type { Language } from "./language";
import { Gender, UserMembershipStatus } from "../constants/user";
import {
  // Auth
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  // 2FA
  enableTwoFactorSchema,
  confirmTwoFactorSchema,
  disableTwoFactorSchema,
  regenerateBackupCodesSchema,
  // Create
  createUserSchema,
  registerUserSchema,
  // Update
  updateUserProfileSchema,
  updateUserDetailsSchema,
  updateUserRolesSchema,
  toggleUserStatusSchema,
  // Form (frontend)
  userFormSchema,
  createUserFormSchema,
  updateUserFormSchema,
  // Params
  userIdParamSchema,
  // Query
  userQuerySchema,
  // GDPR
  updateConsentSchema,
  requestDataExportSchema,
  requestAccountDeletionSchema,
} from "../validators/user";

// ============================================================================
// ENTITY TYPES — mirror del Prisma schema (solo campi safe, no secrets)
// ============================================================================

/**
 * UserDetails entity — vertical partition of `user_details`.
 * Mirrors the non-sensitive columns of the Prisma `UserDetails` model.
 * `id` is autoincrement Int; `userId` is a cuid String (FK → users.id).
 */
export type UserDetails = {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  countryCode: string | null;
  dateOfBirth: Date | null;
  gender: Gender;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Slim role shape used inside membership responses.
 * Avoids importing the full Role entity with its relations.
 */
export type MembershipRole = {
  id: number;
  code: string;
  name: string;
  permissions: Pick<Permission, "code">[];
};

/**
 * A single tenant membership as returned by the API.
 * Corresponds to `UserTenantMembership` + its roles in user.prisma.
 */
export type UserMembership = {
  tenantId: string;
  status: UserMembershipStatus;
  isDefault: boolean;
  roles: MembershipRole[];
};

/**
 * Safe User entity — never includes password or security-internal tokens.
 * This is the shape produced by `mapUserResponse()` in user-helper.ts
 * and returned by every authenticated endpoint.
 */
export type User = {
  id: string;
  username: string;
  email: string;
  active: boolean;
  // Email verification (status only — no tokens)
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  // 2FA (status only — no secrets)
  twoFactorEnabled: boolean;
  // Security counters (read-only, useful for admin views)
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastPasswordChangeAt: Date | null;
  // GDPR
  consentGivenAt: Date | null;
  dataRetentionExpiresAt: Date | null;
  // Preferences
  preferredLanguageId: number | null;
  preferredLanguage?: Language;
  // Relations
  details?: UserDetails | null;
  currentTenant: UserMembership;
  availableTenants: UserMembership[];
  // Soft-delete
  deletedAt: Date | null;
  // Timestamps
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// INPUT TYPES — z.infer from validators
// ============================================================================

// --- Create ---
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;

// --- Update ---
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserDetailsInput = z.infer<typeof updateUserDetailsSchema>;
export type UpdateUserRolesInput = z.infer<typeof updateUserRolesSchema>;
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;

// --- Auth ---
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// --- 2FA ---
export type EnableTwoFactorInput = z.infer<typeof enableTwoFactorSchema>;
export type ConfirmTwoFactorInput = z.infer<typeof confirmTwoFactorSchema>;
export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>;
export type RegenerateBackupCodesInput = z.infer<typeof regenerateBackupCodesSchema>;

// --- GDPR ---
export type UpdateConsentInput = z.infer<typeof updateConsentSchema>;
export type RequestDataExportInput = z.infer<typeof requestDataExportSchema>;
export type RequestAccountDeletionInput = z.infer<typeof requestAccountDeletionSchema>;

// --- Form (frontend only) ---
export type UserFormInput = z.infer<typeof userFormSchema>;
export type CreateUserFormInput = z.infer<typeof createUserFormSchema>;
export type UpdateUserFormInput = z.infer<typeof updateUserFormSchema>;

// ============================================================================
// PARAM TYPES — z.infer from validators
// ============================================================================

export type UserIdParam = z.infer<typeof userIdParamSchema>;

// ============================================================================
// QUERY TYPES — z.infer from validators
// ============================================================================

export type UserQueryInput = z.infer<typeof userQuerySchema>;

// ============================================================================
// UTILITY TYPES — response shapes and derived views
// ============================================================================

/**
 * Slim user entry for list/table views.
 * No sensitive data; no heavy relations.
 */
export type UserListItem = {
  id: string;
  username: string;
  email: string;
  active: boolean;
  details: {
    firstName: string | null;
    lastName: string | null;
    gender: Gender
  }
  profilePicture: string | null;
  currentTenant: Pick<UserMembership, "tenantId" | "status" | "roles">;
  availableTenants: Pick<UserMembership, "tenantId" | "status" | "roles">[];
  lastLogin: Date | null;
  createdAt: Date;
};

/**
 * Full user with details guaranteed non-null.
 * Used in admin detail pages and profile views.
 */
export type UserComplete = Omit<User, "details"> & {
  details: UserDetails;
  preferredLanguage: Language;
};

/**
 * Public-safe profile (anonymous/shareable view).
 */
export type UserProfile = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: Date;
};

// ============================================================================
// SESSION / JWT PAYLOAD TYPES
// Allineati con UserPayload in packages/backend/types/user-types.ts
// ============================================================================

/**
 * Tenant context embedded in the JWT access token.
 */
export type CurrentTenantPayload = {
  tenantId: string;
  membershipId: string;
  status: UserMembershipStatus;
  roles: RoleDTO[]; // role codes
  permissions: string[]; // permission codes
};

export type RoleDTO = {
  id: number;
  code: string;
  name: string;
};

/**
 * Available tenant entry in the JWT (for tenant-switcher UI).
 */
export type AvailableTenantEntry = {
  tenantId: string;
  name: string;
  code: string;
  isDefault: boolean;
  status: UserMembershipStatus;
};

/**
 * Full JWT/session payload — matches UserPayload in user-helper.ts.
 * Stored in access token claims; never includes secrets.
 */
export type UserSessionPayload = {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguageId: number | null;
  currentTenant: CurrentTenantPayload;
  availableTenants: AvailableTenantEntry[];
  // --- CLAIMS STANDARD JWT ---
  fingerprint?: string; // Browser fingerprint
  jti?: string; // JWT ID
  iat?: number; // Issued at
  exp?: number; // Expires at
  iss?: string; // Issuer
  aud?: string; // Audience
};

// ============================================================================
// AUTH RESPONSE TYPES
// ============================================================================

/**
 * Shape of the response body from POST /api/users/login and
 * POST /api/users/refresh-token.
 */
export type AuthResult = {
  user: UserSessionPayload;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // milliseconds (authConfig.jwt.expiresInMs)
};

/**
 * 2FA setup response — returned after enabling TOTP.
 */
export type TwoFactorSetupResult = {
  secret: string;
  qrCode: string; // data-URL or provisioning URI
  backupCodes: string[];
};

// ============================================================================
// SECURITY / AUDIT TYPES
// ============================================================================

/**
 * Admin security overview for a single user account.
 */
export type UserSecurityAudit = {
  userId: string;
  passwordAgeDays: number;
  failedLoginAttempts: number;
  lastFailedLoginAt: Date | null;
  isLocked: boolean;
  lockedUntil: Date | null;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  lastPasswordChangeAt: Date | null;
  passwordResetAttempts: number;
};

/**
 * Aggregated user statistics for the admin dashboard.
 */
export type UserStats = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  verifiedEmails: number;
  unverifiedEmails: number;
  twoFactorEnabled: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
};

// ============================================================================
// GDPR TYPES
// ============================================================================

/**
 * Portable data export for GDPR right-to-access requests.
 * Heavy relations are typed as `unknown[]` to avoid
 * importing every domain type into @mini-erp/shared.
 */
export type UserGDPRExport = {
  user: Pick<User, "id" | "username" | "email" | "createdAt"> & {
    details: UserDetails | null;
  };
  relatedData: Record<string, unknown[]>;
  exportedAt: Date;
  expiresAt: Date;
};
