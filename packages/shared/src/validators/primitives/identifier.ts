import { z } from "zod";

/**
 * Schema per UUID (Zod v4)
 */
export const uuidSchema = (required = false) => {
  const baseSchema = z.uuid("UUID non valido");

  return required ? baseSchema : baseSchema.optional().nullable();
};

/**
 * Schema per CUID (Zod v4)
 */
export const cuidSchema = (required = false) => {
  const baseSchema = z.cuid("CUID non valido");
  return required ? baseSchema : baseSchema.optional().nullable();
};
