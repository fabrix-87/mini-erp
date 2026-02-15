import { z } from "zod";
import { contactSortFieldSchema } from "../validators";

/**
 * Campi ordinabili per Contact
 */
export type ContactSortField = z.infer<typeof contactSortFieldSchema>;
