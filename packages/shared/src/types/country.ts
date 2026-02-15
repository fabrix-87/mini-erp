// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import {
  countryCodeSchema,
  countryQuerySchema,
  countrySchema,
} from "../validators";
import { Language } from "./language";

export type Country = z.infer<typeof countrySchema> & {
  languages?: Language[];
};

// Query type
export type CountryQueryInput = z.infer<typeof countryQuerySchema>;
// Param type
export type CountryCodeParam = z.infer<typeof countryCodeSchema>;
