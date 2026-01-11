// types/api.ts

import { User } from "./user";

// ============ JWT Types ============
export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  roles: Array<{ id: number; code: string; name: string }>;
  fingerprint?: string;
  jti: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

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
export interface ApiResponse<T = any> {
  status: "success" | "fail" | "error";
  message?: string;
  data: T;
  results?: number;
  pagination?: PaginationInfo;
  errors?: ValidationError[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  status: "success";
  results: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: T[];
}

export interface ApiError {
  statusCode?: number;
  status?: string;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface ApiErrorResponse {
  status?: string;
  error?: ApiError;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}
