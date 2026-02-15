// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";

import { Company } from "./company";
import { Activity, ActivityParticipant } from "./activity";
import { Document } from "./document";
import {
  checkEmailSchema,
  contactIdSchema,
  contactQuerySchema,
  createContactSchema,
  toggleContactActiveSchema,
  updateContactSchema,
} from "../validators";

// Entity Types
export type Contact = z.infer<typeof createContactSchema> & {
  id: number;
  company: Company;
  createdAt: Date;
  updatedAt: Date;
  documents: Document[];
  activities: Activity[];
  activityPartecipants: ActivityParticipant[];
};

/**
 * Contact con dati aggregati
 */
export type ContactWithStats = Contact & {
  documentCount: number;
  lastContactDate?: string | null;
};

// imput types
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
// Query Types
export type ContactQueryInput = z.infer<typeof contactQuerySchema>;
// Query Actions
export type CheckMailInput = z.infer<typeof checkEmailSchema>;
export type ToggleContactActiveInput = z.infer<
  typeof toggleContactActiveSchema
>;
// Param Types
export type ContactIdInput = z.infer<typeof contactIdSchema>;
