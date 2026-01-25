import { z } from "zod";
import { sortOrderSchema } from "../utils";

export type SortOrder = z.infer<typeof sortOrderSchema>;
