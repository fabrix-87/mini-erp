import { z } from "zod";
import { createIdSchema } from "./primitives/id";

export const languageSchema = z.object({
  id: createIdSchema("Language ID non valido"),
  name: z.string().max(50),
  iso_code: z.string().max(2),
  language_code: z.string().max(5),
});
