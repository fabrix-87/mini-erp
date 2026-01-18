import z from "zod";
import { CountrySchema } from "../validators";
import { Language } from "./language";

export type Country = z.infer<typeof CountrySchema> & {
    languages?: Language[]
}