import { ApiResponse, User } from "@mini-erp/shared";

export type {
  User,
  LoginInput,
  UpdateUserDetailsInput,
  UpdateUserProfileInput,
  RegisterUserInput,
  CreateUserFormInput,
  UpdateUserFormInput,
} from "@mini-erp/shared/types";

export { createUserFormSchema, updateUserFormSchema } from "@mini-erp/shared/validators";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: object) => [...userKeys.lists(), params] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface UserListApiResponse extends ApiResponse<User[]> {}
export interface UserSingleApiResponse extends ApiResponse<User> {}
export interface UserDeleteApiResponse extends ApiResponse<null> {}
