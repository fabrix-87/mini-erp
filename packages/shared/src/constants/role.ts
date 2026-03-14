import { z } from "zod";
import { roleSortFieldSchema } from "../validators";

export type RoleSortField = z.infer<typeof roleSortFieldSchema>;