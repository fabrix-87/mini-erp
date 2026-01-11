// packages/shared/src/types/user.ts

// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import {
  ChangePasswordSchema,
  CreateUserFormSchema,
  CreateUserSchema,
  ForgotPasswordSchema,
  GenderSchema,
  LoginSchema,
  RegisterUserSchema,
  ResetPasswordSchema,
  UpdateUserDetailsSchema,
  UpdateUserFormSchema,
  UpdateUserProfileSchema,
  UpdateUserRolesSchema,
  UserDetailsSchema,
  UserFormSchema,
  UserIdParamSchema,
  UserQuerySchema,
  UserSchema,
} from "../validators";

export type User = z.infer<typeof UserSchema>;
export type UserDetails = z.infer<typeof UserDetailsSchema>;

export type GenderType = z.infer<typeof GenderSchema>;
export type UserFormValues = z.infer<typeof UserFormSchema>;
export type CreateUserFormValues = z.infer<typeof CreateUserFormSchema>;
export type UpdateUserFormValues = z.infer<typeof UpdateUserFormSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateUserDetailsInput = z.infer<typeof UpdateUserDetailsSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UserIdInput = z.infer<typeof UserIdParamSchema>;

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type UpdateUserRolesInput = z.infer<typeof UpdateUserRolesSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type UserQueryInput = z.infer<typeof UserQuerySchema>;
