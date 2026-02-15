import { z } from "zod";

/**
 * Schema per email normalizzato (Zod v4)
 */
export const emailSchema = (message?: string) => {
  return z
    .email(message || "Email non valida")
    .toLowerCase()
    .trim();
};

/**
 * Schema per telefono
 */
export const phoneSchema = z
  .string()
  .max(20, "Telefono troppo lungo")
  .regex(/^[+]?[\d\s()-]*$/, "Formato telefono non valido")
  .optional()
  .nullable();

/**
 * Schema per URL (Zod v4)
 */
export const urlSchema = (required = false, max = 500) => {
  const baseSchema = z.url("URL non valido").max(max, `URL max ${max} caratteri`);

  return required ? baseSchema : baseSchema.optional().nullable();
};
