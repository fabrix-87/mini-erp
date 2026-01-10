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