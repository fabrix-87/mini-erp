// types/api.ts
// ============ API Query Types ============
export interface PaginationQueryType {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
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

// ============ User Types ============
export interface UserDetails {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  bio?: string;
  lastLogin?: string;
  active: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
  UserDetail?: UserDetails;
}

export interface UserAuth {
  userId: number;
  email: string;
  username: string;
  roles: Array<{ id: number; code: string; name: string }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
}

export interface UpdateDetailsData {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  bio?: string;
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
