import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { paginationSchema, querySortOrderSchema } from "./query";

/**
 * Allowed sort fields for languages list queries.
 */
export const languageSortFieldSchema = z.enum([
  "id",
  "name",
  "isoCode",
  "languageCode",
  "createdAt",
  "updatedAt",
]);

export const languageSchema = z.object({
  id: createIdSchema("Language ID non valido"),
  name: z.string().max(50),
  isoCode: z.string().max(2),
  languageCode: z.string().max(5),
});

export const languageQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  sortOrder: querySortOrderSchema().default("asc"),
  sortBy: languageSortFieldSchema.default("id"),
});
