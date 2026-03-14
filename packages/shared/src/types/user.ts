// ============================================================================
// USER TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Role } from "./role";
import type { Language } from "./language";
import type { Document } from "./document";
import type { Opportunity } from "./opportunity";
import type { Company } from "./company";
import type { Activity, ActivityParticipant } from "./activity";
import type { CompanyNote } from "./company";
import type { StockMovement } from "./warehouse";
import type { AuditLog } from "./audit";
import type { Product, ProductVariant } from "./product";
import type { Customer } from "./customer";
import type { Supplier } from "./supplier";
import type { Lead } from "./lead";
import {
  userFormSchema,
  createUserFormSchema,
  updateUserFormSchema,
  userIdParamSchema,
  userIdAsUserIdParamSchema,
  loginSchema,
  twoFactorLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationEmailSchema,
  enableTwoFactorSchema,
  confirmTwoFactorSchema,
  disableTwoFactorSchema,
  regenerateBackupCodesSchema,
  createUserSchema,
  registerUserSchema,
  updateUserProfileSchema,
  updateUserDetailsSchema,
  changePasswordSchema,
  updateUserRolesSchema,
  toggleUserStatusSchema,
  unlockUserSchema,
  userQuerySchema,
  updateConsentSchema,
  requestDataExportSchema,
  requestAccountDeletionSchema,
} from "../validators/user";

import { Gender } from "../constants/user";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * User Details entity
 */
export type UserDetails = {
  id: number;
  userId: number;
  user: User;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  dateOfBirth: Date | null;
  gender: Gender;
  bio: string | null;
  lastLogin: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * User entity
 */
export type User = Omit<CreateUserInput, "password" | "roleIds" | "details"> & {
  id: number;
  // Email verification
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  emailVerifiedAt: Date | null;
  // Password reset
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  passwordResetAttempts: number;
  lastPasswordResetAt: Date | null;
  // Two-factor authentication
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  twoFactorBackupCodes: Record<string, any> | null;
  // Security & Audit
  lastPasswordChangeAt: Date | null;
  passwordChangedBy: number | null;
  failedLoginAttempts: number;
  lastFailedLoginAt: Date | null;
  lockedUntil: Date | null;
  // GDPR & Privacy
  consentGivenAt: Date | null;
  dataRetentionExpiresAt: Date | null;
  // Relations
  roles: Role[];
  preferredLanguage: Language;
  details?: UserDetails;
  createdDocuments: Document[];
  assignedDocuments: Document[];
  createdOpportunities: Opportunity[];
  assignedOpportunities: Opportunity[];
  assignedCompanies: Company[];
  activitiesAssigned: Activity[];
  activitiesCreated: Activity[];
  activityParticipants: ActivityParticipant[];
  companyNotes: CompanyNote[];
  stockMovement: StockMovement[];
  auditLogs: AuditLog[];
  deletedDocuments: Document[];
  deletedProducts: Product[];
  deletedProductVariants: ProductVariant[];
  deletedCustomers: Customer[];
  deletedSuppliers: Supplier[];
  assignedLeads: Lead[];
  convertedLeads: Lead[];
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserDetailsInput = z.infer<typeof updateUserDetailsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserRolesInput = z.infer<typeof updateUserRolesSchema>;
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;
export type UnlockUserInput = z.infer<typeof unlockUserSchema>;

// Form inputs
export type UserFormInput = z.infer<typeof userFormSchema>;
export type CreateUserFormInput = z.infer<typeof createUserFormSchema>;
export type UpdateUserFormInput = z.infer<typeof updateUserFormSchema>;

// Auth inputs
export type LoginInput = z.infer<typeof loginSchema>;
export type TwoFactorLoginInput = z.infer<typeof twoFactorLoginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationEmailInput = z.infer<
  typeof resendVerificationEmailSchema
>;

// 2FA inputs
export type EnableTwoFactorInput = z.infer<typeof enableTwoFactorSchema>;
export type ConfirmTwoFactorInput = z.infer<typeof confirmTwoFactorSchema>;
export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>;
export type RegenerateBackupCodesInput = z.infer<
  typeof regenerateBackupCodesSchema
>;

// GDPR inputs
export type UpdateConsentInput = z.infer<typeof updateConsentSchema>;
export type RequestDataExportInput = z.infer<typeof requestDataExportSchema>;
export type RequestAccountDeletionInput = z.infer<
  typeof requestAccountDeletionSchema
>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type UserQueryInput = z.infer<typeof userQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type UserIdAsUserIdParam = z.infer<typeof userIdAsUserIdParamSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Simplified user for list views (no sensitive data)
 */
export type UserListItem = {
  id: number;
  username: string;
  email: string;
  active: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  roles: { id: number; name: string }[];
  lastLogin: Date | null;
  createdAt: Date;
};

/**
 * User with full details and relations
 */
export type UserComplete = User & {
  details: UserDetails;
  roles: Role[];
  preferredLanguage: Language;
};

/**
 * User profile (public view, safe to expose)
 */
export type UserProfile = {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: Date;
};

/**
 * User session data (stored in JWT/session)
 */
export type UserSession = {
  userId: number;
  username: string;
  email: string;
  roles: string[]; // role names
  permissions: string[];
  preferredLanguageId: number;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
};

/**
 * User authentication result
 */
export type AuthResult = {
  user: UserSession;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  requiresTwoFactor: boolean;
  twoFactorToken?: string; // temporary token if 2FA required
};

/**
 * Two-factor setup result
 */
export type TwoFactorSetupResult = {
  secret: string;
  qrCode: string; // base64 or URL
  backupCodes: string[];
};

/**
 * User statistics
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  verifiedEmails: number;
  unverifiedEmails: number;
  twoFactorEnabled: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  averageLoginFrequency: number; // days
  byRole: Record<string, number>;
}

/**
 * User activity summary
 */
export interface UserActivitySummary {
  userId: number;
  lastLogin: Date | null;
  totalLogins: number;
  loginThisMonth: number;
  loginThisWeek: number;
  totalDocumentsCreated: number;
  totalOpportunitiesAssigned: number;
  totalActivitiesCompleted: number;
  averageResponseTime: number; // hours
  mostActiveDay: string; // day of week
  mostActiveHour: number; // 0-23
}

/**
 * User security audit
 */
export interface UserSecurityAudit {
  userId: number;
  passwordAge: number; // days since last change
  passwordChanges: number; // total password changes
  failedLoginAttempts: number;
  lastFailedLogin: Date | null;
  isLocked: boolean;
  lockedUntil: Date | null;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  lastPasswordChange: Date | null;
  passwordResetAttempts: number;
  suspiciousActivityDetected: boolean;
  riskScore: number; // 0-100
  recommendations: string[];
}

/**
 * User permissions summary
 */
export interface UserPermissionsSummary {
  userId: number;
  roles: {
    id: number;
    name: string;
    permissions: string[];
  }[];
  allPermissions: string[];
  canCreate: string[]; // entities user can create
  canRead: string[]; // entities user can read
  canUpdate: string[]; // entities user can update
  canDelete: string[]; // entities user can delete
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * User GDPR data export
 */
export interface UserGDPRExport {
  user: {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
    details: UserDetails | null;
  };
  activities: Activity[];
  documents: Document[];
  opportunities: Opportunity[];
  leads: Lead[];
  companies: Company[];
  notes: CompanyNote[];
  auditLogs: AuditLog[];
  exportedAt: Date;
  expiresAt: Date;
}

/**
 * Password strength result
 */
export interface PasswordStrengthResult {
  score: number; // 0-4
  feedback: {
    warning: string | null;
    suggestions: string[];
  };
  isWeak: boolean;
  containsUserInfo: boolean; // contains username/email
  meetsRequirements: boolean;
}

/**
 * Login attempt result
 */
export interface LoginAttemptResult {
  success: boolean;
  user?: UserSession;
  requiresTwoFactor: boolean;
  twoFactorToken?: string;
  error?: string;
  remainingAttempts?: number;
  lockoutDuration?: number; // seconds until unlock
}

/**
 * User notification preferences
 */
export interface UserNotificationPreferences {
  userId: number;
  email: {
    enabled: boolean;
    digest: "realtime" | "daily" | "weekly";
    types: string[]; // e.g., ["opportunity_won", "document_assigned"]
  };
  push: {
    enabled: boolean;
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
  };
}

/**
 * User onboarding status
 */
export interface UserOnboardingStatus {
  userId: number;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  isComplete: boolean;
  steps: {
    profileCompleted: boolean;
    emailVerified: boolean;
    twoFactorSetup: boolean;
    firstLoginCompleted: boolean;
    tourCompleted: boolean;
  };
}
