// packages/shared/src/types/user.ts
import { z } from "zod";
import type { Permission, Role } from "./role";
import type { Language } from "./language";
import { Gender, UserMembershipStatus } from "../constants/user";
import {
  // Auth
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
  profileFormSchema,
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
  country: {
    name: string;
  } | null;
  dateOfBirth: Date | null;
  gender: Gender;
  bio: string | null;
};

/// Details projection returned by list endpoints (getUserSelection).
export type UserDetailsSummary = Pick<UserDetails, "firstName" | "lastName" | "gender">;

/// Details projection returned by the detail endpoint (getUserDetailedSelection).
/// Same as UserDetails minus the internal keys, which are not selected.
export type UserDetailsView = Omit<UserDetails, "id" | "userId">;

/// A tenant membership as returned by mapUserResponse() in `availableTenants`.
export type UserMembership = {
  tenantId: string;
  membershipId: string;
  name: string;
  code: string;
  isDefault: boolean;
  status: UserMembershipStatus;
  roles: RoleDTO[];
};

/// The membership resolved as active context; additionally carries permission codes.
export type UserCurrentMembership = UserMembership & {
  permissions: string[];
};

/// Slim user entry for list/table views (GET /api/users).
export type UserListItem = {
  id: string;
  username: string;
  email: string;
  active: boolean;
  twoFactorEnabled: boolean;
  preferredLanguageId: number | null;
  details: UserDetailsSummary | null;
  currentTenant: UserCurrentMembership | null;
  availableTenants: UserMembership[];
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/// Full user entry for the detail view (GET /api/users/:id).
export type User = Omit<UserListItem, "details"> & {
  details: UserDetailsView | null;
};

/// User with details guaranteed non-null (admin detail pages, profile views).
export type UserComplete = Omit<User, "details"> & {
  details: UserDetailsView;
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
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;
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
export type ProfileFormInput = z.input<typeof profileFormSchema>;
export type ProfileFormValues = z.output<typeof profileFormSchema>;

// ============================================================================
// PARAM TYPES — z.infer from validators
// ============================================================================

export type UserIdParam = z.infer<typeof userIdParamSchema>;

// ============================================================================
// QUERY TYPES — z.infer from validators
// ============================================================================

export type UserQueryInput = z.infer<typeof userQuerySchema>;

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
  name: string;
  code: string;
  roles: RoleDTO[]; // role codes
  permissions?: string[]; // permission codes
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
  preferredLanguageId: number | null;
  currentTenant: CurrentTenantPayload;
  details: {
    firstName: string;
    lastName: string;
    gender: string;
  };
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
