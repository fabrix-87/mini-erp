import { z } from "zod";
import { AttributeDisplayTypeSchema } from "../validators";

export type AttributeDisplayType = z.infer<typeof AttributeDisplayTypeSchema>;
