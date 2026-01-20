// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import {
  CreateCustomerSchema,
  CreateSupplierSchema,
  SupplierQuerySchema,
  UpdateSupplierCompanySchema,
  UpdateSupplierRatingSchema,
  UpdateSupplierSchema,
} from "../validators";
import { Company } from "./company";
import { Document } from "./document";

// Supplier
export type Supplier = Omit<z.infer<typeof CreateCustomerSchema>, 'company'> & {
  id: number;
  companyId: number;
  company: Company
  // Dati specifici Fornitore
  paymentTerms?: string;
  creditLimit?: number;
  bankAccount?: string;
  // Costi e Logistica
  leadTimeDays?: number;
  transportCost?: number;
  // Tracking
  firstOrderDate?: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalSpent: string;
  rating?: number;
  // Relazioni a documenti di Acquisto
  documentsIn: Document[];
  products: any; // TODO product[]

  createdAt: Date;
  updatedAt: Date;
};

// Stats interfaces
export interface SupplierStats {
  total: number;
  totalSpent: number;
  avgRating: number;
  byRating: Record<number, number>;
}

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
export type SupplierQueryInput = z.infer<typeof SupplierQuerySchema>;
export type UpdateSupplierCompanyInput = z.infer<
  typeof UpdateSupplierCompanySchema
>;
export type UpdateSupplierRatingInput = z.infer<
  typeof UpdateSupplierRatingSchema
>;
