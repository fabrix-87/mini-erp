// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import {
  CheckEmailSchema,
  ContactIdSchema,
  ContactQuerySchema,
  CreateContactSchema,
  ToggleContactActiveSchema,
  UpdateContactSchema,
} from "../validators";

import { Company } from "./company";
import { Activity, ActivityPartecipant } from "./activity";
import { Document } from "./document";

// Entity Types
export type Contact = z.infer<typeof CreateContactSchema> & {
    id: number;
    company: Company;
    createdAt: Date;
    updatedAt: Date;
    documents: Document[];
    activities: Activity[];
    activityPartecipants: ActivityPartecipant[];
}

/**
 * Contact con dati aggregati
 */
export type ContactWithStats = Contact & {
  documentCount: number;
  lastContactDate?: string | null;
}

// imput types
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
// Query Types
export type ContactQueryInput = z.infer<typeof ContactQuerySchema>;
// Query Actions
export type CheckMailInput = z.infer<typeof CheckEmailSchema>;
export type ToggleContactActiveInput = z.infer<typeof ToggleContactActiveSchema>;
// Param Types
export type ContactIdInput = z.infer<typeof ContactIdSchema>;