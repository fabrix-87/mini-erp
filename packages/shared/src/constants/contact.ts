import { z } from "zod";
import { ContactSortFieldSchema } from "../validators";

/**
 * Campi ordinabili per Contact
 */
export type ContactSortField = z.infer<typeof ContactSortFieldSchema>;
