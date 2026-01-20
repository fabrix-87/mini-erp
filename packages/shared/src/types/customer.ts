// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import { Company } from "./company";
import {
  CreateCustomerSchema,
  CreditCheckStatusSchema,
  CustomerIdSchema,
  CustomerPrioritySchema,
  CustomerQuerySchema,
  CustomerSegmentSchema,
  CustomerSizeSchema,
  CustomerTypeSchema,
  LeadStatusSchema,
  UpdateCustomerCompanySchema,
  UpdateCustomerSchema,
  UpdateLeadStatusSchema,
} from "../validators";
import { Document } from "./document";
import { Opportunity } from "./opportunity";
import { Activity } from "./activity";


export type Customer = Omit<z.infer<typeof CreateCustomerSchema>, 'company'> & {
  id: number;
  companyId: number;
  company: Company
  // Dati Commerciali
  defaultPriceList?: any; // TODO PRICE LIST
  customerTaxRule?: any; // TODO TAX RULE
  paymentMethod?: any; // TODO PAYMENT METHOD
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
}

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type UpdateCustomerCompanyInput = z.infer<
  typeof UpdateCustomerCompanySchema
>;
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
export type CustomerType = z.infer<typeof CustomerTypeSchema>;
export type CustomerPriority = z.infer<typeof CustomerPrioritySchema>;
export type CustomerSegment = z.infer<typeof CustomerSegmentSchema>;
export type LeadStatus = z.infer<typeof LeadStatusSchema>;
export type CreditCheckStatus = z.infer<typeof CreditCheckStatusSchema>;
export type CustomerSize = z.infer<typeof CustomerSizeSchema>;
export type CustomerQueryInput = z.infer<typeof CustomerQuerySchema>;
export type CustomerIdInput = z.infer<typeof CustomerIdSchema>;
