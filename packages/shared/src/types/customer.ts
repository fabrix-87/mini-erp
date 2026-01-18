import z from "zod";
import { Company } from "./company";
import {
  CreateCustomerSchema,
  CreditCheckStatusSchema,
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

export type Customer = Company & {};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

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
