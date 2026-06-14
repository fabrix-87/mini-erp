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

export interface UserPayload {
  // --- IDENTITÀ GLOBALE (dalla tabella User e UserDetails) ---
  userId: string; // Notare che nel modello è uno String (cuid)
  email: string;
  username: string;
  preferredLanguageId: number | null;
  firstName: string;
  lastName: string;

  // --- CONTESTO TENANT ATTIVO (La membership corrente) ---
  currentTenant: {
    tenantId: string;
    membershipId: string;
    status: "ACTIVE" | "INVITED" | "SUSPENDED";
    // I ruoli estratti dalla relazione UserTenantMembershipRole per QUESTO tenant
    roles: Array<{
      id: number;
      code: string;
      name: string;
    }>;
    permissions: string[];
  };

  // --- ALTRI TENANT DISPONIBILI (per lo switch rapido nel frontend) ---
  // Array minimale per popolare una select/dropdown aziendale nel frontend
  availableTenants: Array<{
    tenantId: string;
    name: string;
    code: string;
    isDefault: boolean;
    status: "ACTIVE" | "INVITED" | "SUSPENDED";
  }>;

  // --- CLAIMS STANDARD JWT ---
  fingerprint?: string; // Browser fingerprint
  jti?: string;        // JWT ID
  iat?: number;        // Issued at
  exp?: number;        // Expires at
  iss?: string;        // Issuer
  aud?: string;        // Audience
}