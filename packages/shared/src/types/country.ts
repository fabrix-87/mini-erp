// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import {
  CountryCodeSchema,
  CountryQuerySchema,
  CountrySchema,
} from "../validators";
import { Language } from "./language";

export type Country = z.infer<typeof CountrySchema> & {
  languages?: Language[];
};

// Query type
export type CountryQueryInput = z.infer<typeof CountryQuerySchema>;
// Param type
export type CountryCodeParam = z.infer<typeof CountryCodeSchema>;
