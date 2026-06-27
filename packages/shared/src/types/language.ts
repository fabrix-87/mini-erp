import { z } from "zod";
import {
  languageQuerySchema,
  languageSchema,
  languageSortFieldSchema,
} from "../validators/language";

export type Language = z.infer<typeof languageSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export type LanguageQueryInput = z.infer<typeof languageQuerySchema>;

export const LANGUAGE_SORT_FIELDS: Readonly<Set<LanguageSortField>> = new Set(
  languageSortFieldSchema.options,
);
export type LanguageSortField = z.infer<typeof languageSortFieldSchema>;
