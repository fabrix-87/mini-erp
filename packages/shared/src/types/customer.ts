// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import { Company } from "./company";
import {
  CreateCustomerSchema,
  CustomerIdSchema,
  CustomerQuerySchema,
  UpdateCustomerCompanySchema,
  UpdateCustomerSchema,
  UpdateLeadStatusSchema,
} from "../validators";
import { Document } from "./document";
import { Opportunity } from "./opportunity";
import { Activity } from "./activity";
import { TaxRule } from "./tax";
import {
  CustomerSegment,
  CustomerType,
  LeadStatus,
} from "../constants/customer";
import { PriceList } from "./pricelist";
import { PaymentMethod } from "./payment";

// Entity Types
export type Customer = Omit<z.infer<typeof CreateCustomerSchema>, "company"> & {
  id: number;
  companyId: number;
  company: Company;
  // Dati Commerciali
  defaultPriceList?: PriceList;
  customerTaxRule?: TaxRule;
  paymentMethod?: PaymentMethod; 
  // Tracking/Reportistica
  firstSaleDate?: Date;
  lastSaleDate?: Date;
  totalSales: number;
  totalRevenue: number;
  // Relazioni a documenti di Vendita
  documentsOut: Document[];
  opportunities: Opportunity[];
  activities: Activity[];

  createdAt: Date;
  updatedAt: Date;
};

// Stats type
export type CustomerStats = {
  total: number;
  byType: Record<CustomerType, number>;
  bySegment: Record<CustomerSegment, number>;
  byLeadStatus: Record<LeadStatus, number>;
  totalRevenue: number;
  avgOrderValue: number;
};

// Input Types
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type UpdateCustomerCompanyInput = z.infer<
  typeof UpdateCustomerCompanySchema
>;
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
// Query Types
export type CustomerQueryInput = z.infer<typeof CustomerQuerySchema>;
// Param Types
export type CustomerIdInput = z.infer<typeof CustomerIdSchema>;
