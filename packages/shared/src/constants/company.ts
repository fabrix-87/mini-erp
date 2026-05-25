import { z } from "zod";
import { companyStatusSchema, companyTypeEntitySchema } from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type CompanyStatus = z.infer<typeof companyStatusSchema>;
export type CompanyTypeEntity = z.infer<typeof companyTypeEntitySchema>;

export const CompanyStatus = companyStatusSchema.enum;
export const CompanyTypeEntity = companyTypeEntitySchema.enum;