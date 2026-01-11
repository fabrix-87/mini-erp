import z from "zod";

/**
 * Schema per validare ID utente
 */
export const UserIdSchema = z
  .string()
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().int().positive("ID utente non valido"));
