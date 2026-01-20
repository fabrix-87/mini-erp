// ============================================================================
// TYPE EXPORTS
// ============================================================================

import z from "zod";
import {
  CountryCodeSchema,
  CountryQuerySchema,
  CountrySchema,
} from "../validators";
import { Language } from "./language";

export type Country = z.infer<typeof CountrySchema> & {
  languages?: Language[];
};

export type CountryQueryInput = z.infer<typeof CountryQuerySchema>;
export type CountryCodeInput = z.infer<typeof CountryCodeSchema>;
