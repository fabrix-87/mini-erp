import z from "zod";
import {
  BaseCompanySchema,
  CompanyIdAsCompanyIdSchema,
  CompanyQueryBaseSchema,
  CompanyStatusSchema,
  CompanyTypeEntitySchema,
  CreateCompanyNoteSchema,
  UpdateCompanyNoteSchema,
  UpdateCompanySchema,
} from "../validators";
import { Address } from "./address";
import { Document } from "./document";
import { User } from "./user";

export type Company = z.infer<typeof BaseCompanySchema> & {
  id: number;
  legalAddress: Address;
  documents: Document[];
  notes: CompanyNote[];
};

export type CompanyNote = z.infer<typeof CreateCompanyNoteSchema> & {
  id: number;
  company: Company;
  authorId: number;
  author: User;

  createdAt: Date;
  updatedAt: Date;
}

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

export type CreateCompanyNoteInput = z.infer<typeof CreateCompanyNoteSchema>;
export type UpdateCompanyNoteInput = z.infer<typeof UpdateCompanyNoteSchema>;