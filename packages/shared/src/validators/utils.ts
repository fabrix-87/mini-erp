// validators/utils.ts
import { z } from "zod";

/**
 * Wraps a base string schema to accept empty strings from form inputs.
 * "" | null | undefined → undefined (treated as "not provided")
 */
export const toOptionalField = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (val) => (val === "" || val == null ? undefined : val),
    schema.optional().nullable(),
  );
