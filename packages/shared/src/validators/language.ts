import z from "zod";
import { createIdSchema } from "../utils";

export const LanguageSchema = z.object({
    id: createIdSchema("Language ID non valido"),
    name: z.string().max(50),
    iso_code: z.string().max(2),
    language_code: z.string().max(5)
})