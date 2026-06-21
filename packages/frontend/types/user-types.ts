import { ApiResponse, Gender, PaginatedResponse, User, UserListItem } from "@mini-erp/shared";
import { LucideIcon, Minus, User as UserIcon, UserCheck, Users } from "lucide-react";

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

export type UserListApiResponse = PaginatedResponse<UserListItem>;
export interface UserSingleApiResponse extends ApiResponse<User> {}
export interface UserDeleteApiResponse extends ApiResponse<null> {}
export interface UserStatsResponse {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

// ============================================================================
// UI TYPES
// ============================================================================

interface DisplayOptions {
  icon: LucideIcon;
  label: string;
  textColor: string;
  bgColor: string;
}

export const GENDER_DISPLAY_CONFIG: Record<Gender, DisplayOptions> = {
  MALE: {
    icon: UserIcon,
    label: 'Uomo',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50', // Adatto per badge o container
  },
  FEMALE: {
    icon: UserCheck,
    label: 'Donna',
    textColor: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900/50',
  },
  OTHER: {
    icon: Users,
    label: 'Altro',
    textColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50',
  },
  PREFER_NOT_TO_SAY: {
    icon: Minus,
    label: 'Preferisco non specificare',
    textColor: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60',
  },
} as const;