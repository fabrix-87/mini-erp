import { z } from "zod";
import { continentsEnum } from "../validators";

export type continents = z.infer<typeof continentsEnum>;
