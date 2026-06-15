import { z } from "zod";
import { createIdSchema } from "./primitives/id";

export const languageSchema = z.object({
  id: createIdSchema("Language ID non valido"),
  name: z.string().max(50),
  isoCode: z.string().max(2),
  languageCode: z.string().max(5),
});
