import { BaseCompany } from "./company";

// Supplier specific fields
export interface Supplier extends BaseCompany {
  companyId: number;
  paymentTerms?: string;
  creditLimit?: number;
  bankAccount?: string;
  leadTimeDays?: number;
  transportCost?: number;

  // Tracking
  firstOrderDate?: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalSpent: string;
  rating?: number;

  company?: BaseCompany;
}

// Query params
export interface SupplierQueryParams {
  page: number;
  limit?: number;
  search?: string;
  minRating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Stats interfaces
export interface SupplierStats {
  total: number;
  totalSpent: number;
  avgRating: number;
  byRating: Record<number, number>;
}
