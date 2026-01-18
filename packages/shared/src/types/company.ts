import z from "zod";
import {
  BaseCompanySchema,
  CompanyIdAsCompanyIdSchema,
  CompanyQueryBaseSchema,
  CompanyStatusSchema,
  CompanyTypeEntitySchema,
  UpdateCompanySchema,
} from "../validators";
import { Address } from "./address";

export type Company = z.infer<typeof BaseCompanySchema> & {
  id: true;
  legalAddress: Address;
};

export type CompanyIdAsCompanyIdInput = z.infer<
  typeof CompanyIdAsCompanyIdSchema
>;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BaseCompanyInput = z.infer<typeof BaseCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
export type CompanyStatus = z.infer<typeof CompanyStatusSchema>;
export type CompanyEntityType = z.infer<typeof CompanyTypeEntitySchema>;
export type CompanyQueryInput = z.infer<typeof CompanyQueryBaseSchema>;
