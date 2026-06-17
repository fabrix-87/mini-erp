// types/api.ts

import { User } from "./user-types";

// ============ API Query Types ============
export interface PaginationQueryType {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
}

// ============ Auth Specific Types ============
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// La risposta del backend per login/refresh solitamente è wrappata in ApiResponse
// Quindi ApiResponse<AuthResponse> conterrà questo oggetto in .data
export interface AuthResponse extends AuthTokens {
  user: User;
}

// ============ API Response Types ============
export type {
  ApiResponse,
  PaginationInfo,
  ValidationError,
  ApiError,
  ApiErrorResponse,
  PaginatedResponse
} from '@mini-erp/shared'



