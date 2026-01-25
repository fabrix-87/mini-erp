// ============ API Response Types ============
export type ApiStatus = "success" | "fail" | "error";

export interface ApiResponse<T = any> {
  status: ApiStatus,
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

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  results: number;
  pagination: PaginationInfo;
};

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
