import z from "zod";
import { LanguageSchema } from "../validators/language";

export type Language = z.infer<typeof LanguageSchema> & {
    createdAt: Date,
    updatedAt: Date
}