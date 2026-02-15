import z from "zod";
import { languageSchema } from "../validators/language";

export type Language = z.infer<typeof languageSchema> & {
    createdAt: Date,
    updatedAt: Date
}