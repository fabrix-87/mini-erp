import { z } from "zod";
import { ContinentsEnum } from "../validators";

export type continents = z.infer<typeof ContinentsEnum>;
