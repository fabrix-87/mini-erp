import { z } from "zod";
import { activityStatusSchema, activityTypeSchema } from "../validators";

export type ActivityStatus = z.infer<typeof activityStatusSchema>;
export type ActivityType = z.infer<typeof activityTypeSchema>;
